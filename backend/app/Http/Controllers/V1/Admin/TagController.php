<?php
namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\TagRequest;
use App\Http\Resources\V1\Admin\TagResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class TagController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,name',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $query = Tag::when($validated['search'] ?? null, fn($q, $search) =>
                    $q->where('name', 'like', "%$search%")
                )
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $tags = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Tags retrieved successfully.'),
                'tags' => TagResource::collection($tags),
                'pagination' => new PaginationResource($tags),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve tags.'), $e);
        }
    }

    public function show(Tag $tag)
    {
        return response()->json([
            'result' => true,
            'message' => __('Tag found successfully.'),
            'tag' => new TagResource($tag),
        ]);
    }

    public function store(TagRequest $request)
    {
        try {
            DB::beginTransaction();

            $tag = Tag::create($request->only(['name']));

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Tag created successfully.'),
                'tag' => new TagResource($tag),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create tag.'), $e);
        }
    }

    public function update(TagRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $tag = Tag::findOrFail($id);
            $tag->update($request->only(['name']));

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Tag updated successfully.'),
                'tag' => new TagResource($tag),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update tag.'), $e);
        }
    }

    public function destroy(Tag $tag)
    {
        try {
            DB::beginTransaction();

            $tag->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Tag deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete tag.'), $e);
        }
    }
}
