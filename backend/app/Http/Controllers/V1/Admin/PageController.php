<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\PageRequest;
use App\Http\Resources\V1\Admin\PageResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class PageController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:created_at,slug,title',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $locales = config('app.locales', ['en']);

            $query = Page::query()
                ->when($validated['search'] ?? null, function ($q, $search) use ($locales) {
                    $q->where(function ($query) use ($search, $locales) {
                        foreach ($locales as $index => $locale) {
                            if ($index === 0) {
                                $query->where("title->$locale", 'like', "%$search%");
                            } else {
                                $query->orWhere("title->$locale", 'like', "%$search%");
                            }
                        }
                    });
                })
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $pages = $query->paginate($perPage);

            return response()->json([
                'result'     => true,
                'message'    => __('Pages retrieved successfully.'),
                'pages'      => PageResource::collection($pages),
                'pagination' => new PaginationResource($pages),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve page data.'), $e);
        }
    }

    public function show(Page $page)
    {
        return response()->json([
            'result' => true,
            'message' => __('Page found successfully.'),
            'page' => new PageResource($page),
        ]);
    }

    public function update(PageRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $page = Page::findOrFail($id);
            $page->update([
                'slug'    => $request->input('slug', $page->slug),
                'title'   => $request->input('title', $page->getTranslations('title')),
                'content' => $request->input('content', $page->getTranslations('content')),
            ]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Page updated successfully.'),
                'page' => new PageResource($page),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update page.'), $e);
        }
    }
}
