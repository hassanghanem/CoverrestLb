<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\AddressRequest;
use App\Http\Resources\V1\Admin\AddressResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,address,recipient_name,city,phone_number,notes,is_active,is_default',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
                'client_id' => 'nullable|exists:clients,id',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The selected sort is invalid.'),
                'order.in' => __('The selected order is invalid.'),
                'client_id.exists' => __('The selected client is invalid.'),
            ]);

            $query = Address::with('client')
                ->when($validated['client_id'] ?? null, fn($q, $clientId) => $q->where('client_id', $clientId))
                ->when($validated['search'] ?? null, function ($q, $search) {
                    $q->where(function ($inner) use ($search) {
                        $inner->where('address', 'like', "%$search%")
                            ->orWhere('city', 'like', "%$search%")
                            ->orWhere('phone_number', 'like', "%$search%")
                            ->orWhere('recipient_name', 'like', "%$search%")
                            ->orWhere('notes', 'like', "%$search%");

                    });
                })
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $addresses = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Addresses retrieved successfully.'),
                'addresses' => AddressResource::collection($addresses),
                'pagination' => new PaginationResource($addresses),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve addresses.'), $e);
        }
    }

    public function show(Address $address)
    {
        $address->load('client');

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

            $data = $request->validated(); // includes client_id

            $hasAddresses = Address::where('client_id', $data['client_id'])->exists();

            if (!isset($data['is_default']) || !$data['is_default']) {
                // If this is the first address for the client, make it default
                $data['is_default'] = !$hasAddresses;
            } else {
                // If explicitly set as default, unset other defaults for this client
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

            $address = Address::findOrFail($id);
            $address->fill($request->validated());

            if ($request->has('is_default')) {
                $isDefault = $request->boolean('is_default');

                if ($isDefault) {
                    // Unset all other defaults for the same client
                    Address::where('client_id', $address->client_id)
                        ->where('id', '!=', $address->id)
                        ->update(['is_default' => false]);

                    $address->is_default = true;
                } else {
                    // Ensure at least one default remains
                    $otherDefault = Address::where('client_id', $address->client_id)
                        ->where('id', '!=', $address->id)
                        ->where('is_default', true)
                        ->first();

                    $address->is_default = $otherDefault ? false : true;
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
            return $this->errorResponse(__('Failed to update address.'), $e);
        }
    }


    public function destroy(Address $address)
    {
        try {
            DB::beginTransaction();

            $clientId = $address->client_id;
            $wasDefault = $address->is_default;

            $address->delete();

            if ($wasDefault) {
                // If default was deleted, make first remaining address default
                $first = Address::where('client_id', $clientId)->orderBy('id')->first();
                if ($first) {
                    $first->is_default = true;
                    $first->save();
                }
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Address deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete address.'), $e);
        }
    }
}
