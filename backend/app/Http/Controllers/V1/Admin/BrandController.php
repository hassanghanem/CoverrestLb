<?php
namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\BrandRequest;
use App\Http\Resources\V1\Admin\BrandResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,name,is_active',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $query = Brand::query()
                ->when(
                    $validated['search'] ?? null,
                    fn($q, $search) =>
                    $q->where('name', 'like', "%$search%")
                )
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $brands = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Brands retrieved successfully.'),
                'brands' => BrandResource::collection($brands),
                'pagination' => new PaginationResource($brands),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve brand data.'), $e);
        }
    }

    public function show(Brand $brand)
    {
        return response()->json([
            'result' => true,
            'message' => __('Brand found successfully.'),
            'brand' => new BrandResource($brand),
        ]);
    }

    public function store(BrandRequest $request)
    {
        try {
            DB::beginTransaction();

            $brand = Brand::create([
                'name' => $request->input('name'),
                'is_active' => $request->boolean('is_active', true),
            ]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Brand created successfully.'),
                'brand' => new BrandResource($brand),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create brand.'), $e);
        }
    }

    public function update(BrandRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $brand = Brand::findOrFail($id);
            $brand->update([
                'name' => $request->input('name'),
                'is_active' => $request->boolean('is_active', $brand->is_active),
            ]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Brand updated successfully.'),
                'brand' => new BrandResource($brand),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update brand.'), $e);
        }
    }

    public function destroy(Brand $brand)
    {
        try {
            $brand->delete();

            return response()->json([
                'result' => true,
                'message' => __('Brand deleted successfully.'),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to delete brand.'), $e);
        }
    }
}
