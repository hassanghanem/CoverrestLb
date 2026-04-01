<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Client\AddressRequest;
use App\Http\Resources\V1\Client\AddressResource;
use App\Http\Resources\V1\Client\PaginationResource;
use App\Models\Address;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class ClientAddressController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,city,address,is_active,is_default',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
                'per_page.integer' => __('The per page must be an integer.'),
                'per_page.min' => __('The per page must be at least :min.'),
                'per_page.max' => __('The per page may not be greater than :max.'),
            ]);

            $clientId = $request->user()->id;

            $addresses = Address::where('client_id', $clientId)
                ->when($validated['search'] ?? null, fn($q, $search) =>
                    $q->where('city', 'like', "%$search%")
                        ->orWhere('address', 'like', "%$search%")
                )
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc')
                ->paginate($validated['per_page'] ?? 10);

            return response()->json([
                'result' => true,
                'message' => __('Addresses retrieved successfully.'),
                'addresses' => AddressResource::collection($addresses),
                'pagination' => new PaginationResource($addresses),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function show(Address $address, Request $request)
    {
        if ($address->client_id !== $request->user()->id) {
            return response()->json([
                'result' => false,
                'message' => __('Unauthorized access.'),
            ]);
        }

        return response()->json([
            'result' => true,
            'message' => __('Address found successfully.'),
            'address' => new AddressResource($address),
        ]);
    }

    public function defaultAddress(Request $request)
    {
        $clientId = $request->user()->id;

        $address = Address::where('client_id', $clientId)
            ->where('is_default', true)
            ->first() ?? Address::where('client_id', $clientId)->orderBy('id')->first();

        if (!$address) {
            return response()->json([
                'result' => false,
                'message' => __('No default address found.'),
            ]);
        }

        return response()->json([
            'result' => true,
            'message' => __('Address found successfully.'),
            'address' => new AddressResource($address),
        ]);
    }

    public function store(AddressRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $data['client_id'] = $request->user()->id;

            if (!isset($data['is_default']) || !$data['is_default']) {
                $data['is_default'] = !Address::where('client_id', $data['client_id'])->exists();
            } else {
                Address::where('client_id', $data['client_id'])->update(['is_default' => false]);
            }

            $address = Address::create($data);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Address created successfully.'),
                'address' => new AddressResource($address),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function update(AddressRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $address = Address::where('id', $id)
                ->where('client_id', $request->user()->id)
                ->firstOrFail();

            $address->fill($request->only([
                'city',
                'address',
                'phone_number',
                'recipient_name',
                'notes',
                'latitude',
                'longitude',
            ]));

            if ($request->has('is_active')) {
                $address->is_active = $request->boolean('is_active');
            }

            if ($request->has('is_default')) {
                if ($request->boolean('is_default')) {
                    Address::where('client_id', $address->client_id)
                        ->where('id', '!=', $address->id)
                        ->update(['is_default' => false]);
                    $address->is_default = true;
                } else {
                    $address->is_default = false;

                    $firstAddress = Address::where('client_id', $address->client_id)
                        ->where('id', '!=', $address->id)
                        ->orderBy('id')
                        ->first();

                    if ($firstAddress) {
                        $firstAddress->is_default = true;
                        $firstAddress->save();
                    }
                }
            }

            $address->save();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Address updated successfully.'),
                'address' => new AddressResource($address),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function destroy(Address $address, Request $request)
    {
        try {
            if ($address->client_id !== $request->user()->id) {
                return response()->json([
                    'result' => false,
                    'message' => __('Unauthorized access.'),
                ]);
            }

            // Check if address is used in any orders
            $ordersCount = Order::where('address_id', $address->id)->count();
            
            if ($ordersCount > 0) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cannot delete address. This address is used in orders.'),
                ]);
            }

            DB::beginTransaction();
            
            $wasDefault = $address->is_default;
            $clientId = $address->client_id;
            
            $address->delete();
            
            // If the deleted address was the default, set another address as default
            if ($wasDefault) {
                $nextAddress = Address::where('client_id', $clientId)
                    ->orderBy('id')
                    ->first();
                
                if ($nextAddress) {
                    $nextAddress->update(['is_default' => true]);
                }
            }
            
            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Address deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
