<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\WarehouseRequest;
use App\Http\Resources\V1\Admin\WarehouseResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,name,location',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ]);

            $query = Warehouse::when(
                $validated['search'] ?? null,
                fn($q, $search) =>
                $q->where('name', 'like', "%$search%")
                    ->orWhere('location', 'like', "%$search%")
            )
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $warehouses = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Warehouses retrieved successfully.'),
                'warehouses' => WarehouseResource::collection($warehouses),
                'pagination' => new PaginationResource($warehouses),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve warehouses.'), $e);
        }
    }

    public function show(Warehouse $warehouse)
    {
        return response()->json([
            'result' => true,
            'message' => __('Warehouse found successfully.'),
            'warehouse' => new WarehouseResource($warehouse),
        ]);
    }

    public function store(WarehouseRequest $request)
    {
        try {
            DB::beginTransaction();

            $warehouse = Warehouse::create($request->only(['name', 'location']));

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Warehouse created successfully.'),
                'warehouse' => new WarehouseResource($warehouse),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create warehouse.'), $e);
        }
    }

    public function update(WarehouseRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $warehouse = Warehouse::findOrFail($id);
            $warehouse->update($request->only(['name', 'location']));

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Warehouse updated successfully.'),
                'warehouse' => new WarehouseResource($warehouse),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update warehouse.'), $e);
        }
    }

    public function destroy(Warehouse $warehouse)
    {
        try {
            DB::beginTransaction();

            $warehouse->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Warehouse deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete warehouse.'), $e);
        }
    }
}
