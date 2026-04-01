<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Client\ReviewRequest;
use App\Http\Resources\V1\Client\ReviewResource;
use App\Models\Review;
use Exception;
use Illuminate\Http\Request;

class ClientReviewController extends Controller
{
    public function store(ReviewRequest $request)
    {
        try {
            $clientId = $request->user()->id;

            $review = Review::updateOrCreate(
                [
                    'client_id' => $clientId,
                    'product_id' => $request->product_id,
                ],
                [
                    'rating' => $request->rating,
                    'comment' => $request->comment,
                    'is_active' => false,
                    'is_view' => false,
                ]
            );

            return response()->json([
                'result' => true,
                'message' => $review->wasRecentlyCreated
                    ? __('Review created successfully.')
                    : __('Review updated successfully.'),
                'review' => new ReviewResource($review),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function destroy(Request $request, Review $review)
    {
        try {
            $clientId = $request->user()->id;

            if ($review->client_id !== $clientId) {
                return response()->json([
                    'result' => false,
                    'message' => __('Unauthorized access.'),
                ], 403);
            }

            $review->delete();

            return response()->json([
                'result' => true,
                'message' => __('Review deleted successfully.'),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
