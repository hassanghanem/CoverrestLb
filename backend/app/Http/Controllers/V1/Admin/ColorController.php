<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\ColorRequest;
use App\Http\Resources\V1\Admin\ColorResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class ColorController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:created_at,name,code',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $locales = config('app.locales', ['en']);

            $query = Color::query()
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
                            $q->orWhere('code', 'like', "%$search%");
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

            $colors = $query->paginate($perPage);

            return response()->json([
                'result'     => true,
                'message'    => __('Colors retrieved successfully.'),
                'colors'     => ColorResource::collection($colors),
                'pagination' => new PaginationResource($colors),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve color data.'), $e);
        }
    }

    public function show(Color $color)
    {
        return response()->json([
            'result'  => true,
            'message' => __('Color found successfully.'),
            'color'   => new ColorResource($color),
        ]);
    }

    public function store(ColorRequest $request)
    {
        try {
            DB::beginTransaction();

            $color = Color::create([
                'name' => $request->input('name'),
                'code' => $request->input('code'),
            ]);

            DB::commit();

            return response()->json([
                'result'  => true,
                'message' => __('Color created successfully.'),
                'color'   => new ColorResource($color),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create color.'), $e);
        }
    }

    public function update(ColorRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $color = Color::findOrFail($id);

            $color->update([
                'name' => $request->input('name'),
                'code' => $request->input('code'),
            ]);

            DB::commit();

            return response()->json([
                'result'  => true,
                'message' => __('Color updated successfully.'),
                'color'   => new ColorResource($color),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update color.'), $e);
        }
    }

    public function destroy(Color $color)
    {
        try {
            DB::beginTransaction();

            $color->delete();

            DB::commit();

            return response()->json([
                'result'  => true,
                'message' => __('Color deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete color.'), $e);
        }
    }
}
