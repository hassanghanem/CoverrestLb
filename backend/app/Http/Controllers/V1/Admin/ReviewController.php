<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Http\Resources\V1\Admin\ReviewResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,rating,is_active,client_name,product_name',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $query = Review::query()
                ->with(['client', 'product'])
                ->leftJoin('clients', 'reviews.client_id', '=', 'clients.id')
                ->leftJoin('products', 'reviews.product_id', '=', 'products.id')
                ->when($validated['search'] ?? null, function ($query, $search) {
                    $query->where('reviews.comment', 'like', "%{$search}%");
                })
                ->when(
                    ($validated['sort'] ?? null) === 'client_name',
                    fn($q) => $q->orderBy('clients.name', $validated['order'] ?? 'asc')
                )
                ->when(
                    ($validated['sort'] ?? null) === 'product_name',
                    fn($q) => $q->orderBy('products.name', $validated['order'] ?? 'asc')
                )
                ->when(
                    !in_array($validated['sort'] ?? '', ['client_name', 'product_name']),
                    fn($q) => $q->orderBy($validated['sort'] ?? 'reviews.created_at', $validated['order'] ?? 'desc')
                )
                ->select('reviews.*');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $reviews = $query->paginate($perPage);

            Review::where('is_view', false)->update(['is_view' => true]);

            return response()->json([
                'result' => true,
                'message' => __('Reviews retrieved successfully.'),
                'reviews' => ReviewResource::collection($reviews),
                'pagination' => new PaginationResource($reviews),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve reviews.'), $e);
        }
    }

    public function show(Review $review)
    {
        return response()->json([
            'result' => true,
            'message' => __('Review found successfully.'),
            'review' => new ReviewResource($review->load(['client', 'product'])),
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'is_active' => 'required|boolean',
            ], [
                'is_active.required' => __('The active status is required.'),
                'is_active.boolean' => __('The active status must be true or false.'),
            ]);

            DB::beginTransaction();

            $review = Review::findOrFail($id);
            $review->update([
                'is_active' => $request->boolean('is_active'),
            ]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Review updated successfully.'),
                'review' => new ReviewResource($review),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update review.'), $e);
        }
    }
}
