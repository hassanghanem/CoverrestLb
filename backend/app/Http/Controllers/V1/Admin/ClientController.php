<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\ClientRequest;
use App\Http\Resources\V1\Admin\ClientResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,name,email,gender,birthdate,phone,is_active',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $sort = $validated['sort'] ?? 'created_at';
            $order = $validated['order'] ?? 'desc';
            $search = $validated['search'] ?? null;

            $query = Client::query()
                ->select('clients.*')
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('clients.name', 'like', "%$search%")
                            ->orWhere('clients.email', 'like', "%$search%")
                            ->orWhere('clients.phone', 'like', "%$search%");
                    });
                })
                ->orderBy("clients.$sort", $order);

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $clients = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Clients retrieved successfully.'),
                'clients' => ClientResource::collection($clients),
                'pagination' => new PaginationResource($clients),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve client data.'), $e);
        }
    }

    public function show(Client $client)
    {
        return response()->json([
            'result' => true,
            'message' => __('Client found successfully.'),
            'client' => new ClientResource($client),
        ]);
    }

    public function store(ClientRequest $request)
    {
        try {
            DB::beginTransaction();

            $client = Client::create($request->validated());

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Client created successfully.'),
                'client' => new ClientResource($client),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create client.'), $e);
        }
    }

    public function update(ClientRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $client = Client::findOrFail($id);

            $client->name = $request->input('name', $client->name);
            $client->gender = $request->input('gender', $client->gender);
            $client->birthdate = $request->input('birthdate', $client->birthdate);
            $client->phone = $request->input('phone', $client->phone);
            $client->email = $request->input('email', $client->email);
            if ($request->has('is_active')) {
                $client->is_active = $request->boolean('is_active');
            }

            $client->save();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Client updated successfully.'),
                'client' => new ClientResource($client),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update client.'), $e);
        }
    }

    public function destroy(Client $client)
    {
        try {
            DB::beginTransaction();

            $client->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Client deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete client.'), $e);
        }
    }
}
