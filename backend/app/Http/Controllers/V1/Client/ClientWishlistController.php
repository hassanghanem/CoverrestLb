<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Client\WishlistItemRequest;
use App\Http\Resources\V1\Client\WishlistResource;
use App\Http\Resources\V1\Client\PaginationResource;
use App\Models\Wishlist;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClientWishlistController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:created_at',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
                'per_page.integer' => __('The per page must be an integer.'),
                'per_page.min' => __('The per page must be at least :min.'),
                'per_page.max' => __('The per page may not be greater than :max.'),
            ]);

            $clientId = $request->user()->id;

            $wishlistItems = Wishlist::with('product','product.category','product.brand')
                ->where('client_id', $clientId)
                ->when($validated['search'] ?? null, function ($query, $search) {
                    $query->whereHas('product', function ($q) use ($search) {
                        $q->where('name', 'like', "%$search%")
                          ->orWhere('sku', 'like', "%$search%");
                    });
                })
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc')
                ->paginate($validated['per_page'] ?? 10);

            return response()->json([
                'result'     => true,
                'message'    => __('Wishlist retrieved successfully.'),
                'wishlist'   => WishlistResource::collection($wishlistItems),
                'pagination' => new PaginationResource($wishlistItems),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred while retrieving wishlist.'), $e);
        }
    }

    public function addOrRemove(WishlistItemRequest $request)
    {
        DB::beginTransaction();

        try {
            $clientId = $request->user()->id;
            $productId = $request->product_id;

            $wishlistItem = Wishlist::where('client_id', $clientId)
                ->where('product_id', $productId)
                ->first();

            if ($wishlistItem) {
                $wishlistItem->delete();

                DB::commit();

                return response()->json([
                    'result' => true,
                    'message' => __('Wishlist removed successfully.'),
                ]);
            } else {
                Wishlist::create([
                    'client_id' => $clientId,
                    'product_id' => $productId,
                ]);

                DB::commit();

                return response()->json([
                    'result' => true,
                    'message' => __('Wishlist added successfully.'),
                ]);
            }
        } catch (Exception $e) {
            DB::rollBack();

            return $this->errorResponse(__('An error occurred while updating wishlist.'), $e);
        }
    }
}
