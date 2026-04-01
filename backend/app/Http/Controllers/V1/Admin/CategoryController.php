<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\CategoryRequest;
use App\Http\Resources\V1\Admin\CategoryResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:created_at,name,arrangement,is_active',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $locales = config('app.locales', ['en']);

            $query = Category::query()
                ->when(
                    $validated['search'] ?? null,
                    function ($query, $search) use ($locales) {
                        $query->where(function ($q) use ($search, $locales) {
                            foreach ($locales as $index => $locale) {
                                if ($index === 0) {
                                    $q->where("name->$locale", 'like', "%$search%");
                                } else {
                                    $q->orWhere("name->$locale", 'like', "%$search%");
                                }
                            }
                        });
                    }
                )
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $categories = $query->paginate($perPage);

            return response()->json([
                'result'      => true,
                'message'     => __('Categories retrieved successfully.'),
                'categories'  => CategoryResource::collection($categories),
                'pagination'  => new PaginationResource($categories),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve category data.'), $e);
        }
    }

    public function show(Category $category)
    {
        return response()->json([
            'result'    => true,
            'message'   => __('Category found successfully.'),
            'category'  => new CategoryResource($category),
        ]);
    }

    public function store(CategoryRequest $request)
    {
        try {
            DB::beginTransaction();

            $category = new Category([
                'name'        => $request->input('name'),
                'is_active'   => $request->boolean('is_active', true),
                'arrangement' => Category::getNextArrangement(),
            ]);

            if ($request->hasFile('image')) {
                $category->image = Category::storeImage($request->file('image'));
            }

            $category->save();
            DB::commit();

            return response()->json([
                'result'    => true,
                'message'   => __('Category created successfully.'),
                'category'  => new CategoryResource($category),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create category.'), $e);
        }
    }

    public function update(CategoryRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $category = Category::findOrFail($id);
            $category->fill([
                'name'        => $request->input('name'),
                'is_active'   => $request->boolean('is_active', $category->is_active),
                'arrangement' => Category::updateArrangement($category, $request->input('arrangement', $category->arrangement)),
            ]);

            if ($request->hasFile('image')) {
                Category::deleteImage($category->getRawOriginal('image'));
                $category->image = Category::storeImage($request->file('image'));
            }

            $category->save();
            DB::commit();

            return response()->json([
                'result'    => true,
                'message'   => __('Category updated successfully.'),
                'category'  => new CategoryResource($category),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update category.'), $e);
        }
    }

    public function destroy(Category $category)
    {
        try {
            if ($category->products()->exists()) {
                return response()->json([
                    'result'  => false,
                    'message' => __('Cannot delete category with products.'),
                ]);
            }

            DB::beginTransaction();

            Category::rearrangeAfterDelete($category->arrangement);
            Category::deleteImage($category->getRawOriginal('image'));
            $category->delete();

            DB::commit();

            return response()->json([
                'result'  => true,
                'message' => __('Category deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete category.'), $e);
        }
    }
}
