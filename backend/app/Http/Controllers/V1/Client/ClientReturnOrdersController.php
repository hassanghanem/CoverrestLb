<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\OrderResource;
use App\Http\Resources\V1\Client\PaginationResource;
use App\Http\Resources\V1\Client\ReturnOrderResource;
use App\Models\Order;
use App\Models\ReturnOrder;
use Exception;
use Illuminate\Http\Request;

class ClientReturnOrdersController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:requested_at,status',
                'order' => 'nullable|in:asc,desc',
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

            $returns = ReturnOrder::with([
                'order',
                'order.client',
                'order.coupon',
                'order.address',
                'details.variant.product.category',
                'details.variant.product.brand',
                'details.variant.product.images',
                'details.variant.color',
                'details.variant.size',
                'details.variant.product.tags',
                'details.variant.product.specifications',
            ])
                ->where('client_id', $clientId)
                ->when($validated['search'] ?? null, function ($query, $search) {
                    $query->whereHas('order', function ($q) use ($search) {
                        $q->where('order_number', 'like', "%$search%");
                    });
                })
                ->orderBy($validated['sort'] ?? 'requested_at', $validated['order'] ?? 'desc')
                ->paginate($validated['per_page'] ?? 10);

            return response()->json([
                'result' => true,
                'message' => __('Return orders retrieved successfully.'),
                'return_orders' => ReturnOrderResource::collection($returns),
                'pagination' => new PaginationResource($returns),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve return orders.'), $e);
        }
    }

    public function show(ReturnOrder $returnOrder, Request $request)
    {
        if ($returnOrder->client_id !== $request->user()->id) {
            return response()->json([
                'result' => false,
                'message' => __('Unauthorized access.'),
            ]);
        }

        $returnOrder->load([
            'order.client',
            'order',
            'details.variant.product',
            'details.variant.color',
            'details.variant.size',
            'details.variant.images',
        ]);

        return response()->json([
            'result' => true,
            'message' => __('Return order retrieved successfully.'),
            'return_order' => new ReturnOrderResource($returnOrder),
        ]);
    }
}
