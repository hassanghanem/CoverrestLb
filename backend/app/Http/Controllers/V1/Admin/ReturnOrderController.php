<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\ReturnOrderRequest;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Http\Resources\V1\Admin\ReturnOrderResource;
use App\Models\Order;
use App\Models\ReturnOrder;
use App\Models\ReturnOrderDetail;
use App\Models\StockAdjustment;
use App\Models\Variant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ReturnOrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:return_order_number,order_number,client_name,status,created_at,reason',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $query = ReturnOrder::with([
                'order.client',
                'order',
                'details.variant.product',
                'details.variant.color',
                'details.variant.size',
            ])
                ->when($validated['search'] ?? null, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->whereHas('order', function ($orderQuery) use ($search) {
                            $orderQuery->where('order_number', 'like', "%$search%")
                                ->orWhereHas('client', function ($clientQuery) use ($search) {
                                    $clientQuery->where('name', 'like', "%$search%")
                                        ->orWhere('email', 'like', "%$search%");
                                });
                        })
                        ->orWhere('reason', 'like', "%$search%");
                    });
                })
                ->when($validated['sort'] ?? null, function ($query, $sort) use ($validated) {
                    $order = $validated['order'] ?? 'desc';

                    switch ($sort) {
                        case 'order_number':
                            $query->join('orders', 'return_orders.order_id', '=', 'orders.id')
                                ->orderBy('orders.order_number', $order)
                                ->select('return_orders.*');
                            break;
                        case 'client_name':
                            $query->join('orders', 'return_orders.order_id', '=', 'orders.id')
                                ->join('clients', 'orders.client_id', '=', 'clients.id')
                                ->orderBy('clients.name', $order)
                                ->select('return_orders.*');
                            break;
                        default:
                            $query->orderBy("return_orders.$sort", $order);
                            break;
                    }
                }, function ($query) {
                    $query->orderBy('return_orders.created_at', 'desc');
                });

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $returns = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Return orders retrieved successfully.'),
                'return_orders' => ReturnOrderResource::collection($returns),
                'pagination' => new PaginationResource($returns),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve return orders.'), $e);
        }
    }

    public function show(ReturnOrder $returnOrder)
    {
        $returnOrder->load([
            'order.client',
            'order',
            'details.variant.product',
            'details.variant.color',
            'details.variant.size',
            'details.stockAdjustments' => function ($query) use ($returnOrder) {
                $query->where('reference_type', 'return_order')
                    ->where('reference_id', $returnOrder->id)
                    ->latest('created_at');
            },
            'details.stockAdjustments.warehouse',
        ]);

        return response()->json([
            'result' => true,
            'message' => __('Return order found successfully.'),
            'return_order' => new ReturnOrderResource($returnOrder),
        ]);
    }

    public function store(ReturnOrderRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $totalRefund = 0;
            $details = [];

            $order = Order::with('orderDetails')->find($data['order_id']);

            if (!$order) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid order.'),
                ]);
            }

            $orderItems = $order->orderDetails->keyBy('variant_id');

            foreach ($data['products'] as $product) {
                $variantId = $product['variant_id'];
                $quantity = $product['quantity'];

                if (!isset($orderItems[$variantId])) {
                    return response()->json([
                        'result' => false,
                        'message' => __('Variant not in order.'),
                    ]);
                }

                $orderedQty = $orderItems[$variantId]->quantity;

                if ($quantity > $orderedQty) {
                    return response()->json([
                        'result' => false,
                        'message' => __('Return quantity exceeds ordered quantity.'),
                    ]);
                }

                $variant = Variant::with('product')->find($variantId);

                if (!$variant) {
                    return response()->json([
                        'result' => false,
                        'message' => __('Invalid variant.'),
                    ]);
                }

                $price = $variant->product->price;
                $refund = $price * $quantity;
                $totalRefund += $refund;

                $details[] = [
                    'variant_id' => $variantId,
                    'quantity' => $quantity,
                    'price' => $price,
                    'refund_amount' => $refund,
                ];
            }

            $returnOrderData = [
                'return_order_number' => ReturnOrder::generateReturnOrderNumber(),
                'created_by' => Auth::id(),
                'status' => 0,
                'order_id' => $data['order_id'],
                'client_id' => $order->client_id,
                'reason' => $data['reason'] ?? '',
            ];

            $returnOrder = ReturnOrder::create($returnOrderData);

            foreach ($details as $detail) {
                $detail['return_order_id'] = $returnOrder->id;
                ReturnOrderDetail::create($detail);
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Return order created successfully.'),
                'return_order' => new ReturnOrderResource($returnOrder->load('details')),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create return order.'), $e);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|integer|min:0|max:3',
            'details' => 'nullable|array',
            'details.*.id' => 'nullable|integer|exists:return_order_details,id',
            'details.*.variant_id' => 'required_without:details.*.id|integer|exists:variants,id',
            'details.*.quantity' => 'required_without:details.*.id|integer|min:1',
            'details.*.price' => 'nullable|numeric|min:0',
            'details.*.refund_amount' => 'nullable|numeric|min:0',
        ], [
            'status.required' => __('Status is required.'),
            'status.integer' => __('Status must be an integer.'),
            'status.min' => __('Status must be at least :min.'),
            'status.max' => __('Status may not be greater than :max.'),
            'details.*.id.exists' => __('One or more return items do not exist.'),
            'details.*.variant_id.required_without' => __('Variant is required when item id is not provided.'),
            'details.*.variant_id.exists' => __('One or more variants do not exist.'),
            'details.*.quantity.required_without' => __('Quantity is required when item id is not provided.'),
            'details.*.quantity.min' => __('Quantity must be at least 1.'),
            'details.*.price.min' => __('Price must be at least 0.'),
            'details.*.refund_amount.min' => __('Refund amount must be at least 0.'),
        ]);

        try {
            DB::beginTransaction();

            $returnOrder = ReturnOrder::with(['details.variant', 'order.orderDetails'])->findOrFail($id);
            $orderItems = $returnOrder->order?->orderDetails?->keyBy('variant_id') ?? collect();

            // Apply detail edits (quantity/price/refund) and allow adding new items
            if (!empty($validated['details'])) {
                $detailsById = $returnOrder->details->keyBy('id');

                foreach ($validated['details'] as $item) {
                    // Update existing detail
                    if (!empty($item['id'])) {
                        /** @var ReturnOrderDetail|null $detail */
                        $detail = $detailsById[$item['id']] ?? null;
                        if (!$detail) continue;

                        $variantId = $detail->variant_id;
                        $orderItem = $orderItems[$variantId] ?? null;

                        if (!$orderItem) {
                            return response()->json([
                                'result' => false,
                                'message' => __('Variant not in original order.'),
                            ], 422);
                        }

                        $totalExisting = $returnOrder->details->where('variant_id', $variantId)->sum('quantity');
                        $allowed = $orderItem->quantity - ($totalExisting - $detail->quantity);

                        $newQty = $item['quantity'] ?? $detail->quantity;

                        if ($newQty > $allowed) {
                            return response()->json([
                                'result' => false,
                                'message' => __('Return quantity exceeds ordered quantity for SKU :sku.', ['sku' => $variantId]),
                            ], 422);
                        }

                        $newPrice = $item['price'] ?? $detail->price;
                        $newRefund = $item['refund_amount'] ?? ($newPrice * $newQty);

                        $detail->update([
                            'quantity' => $newQty,
                            'price' => $newPrice,
                            'refund_amount' => $newRefund,
                        ]);

                        continue;
                    }

                    // Create new detail
                    $variantId = $item['variant_id'] ?? null;
                    $orderItem = $orderItems[$variantId] ?? null;

                    if (!$orderItem) {
                        return response()->json([
                            'result' => false,
                            'message' => __('Variant not in original order.'),
                        ], 422);
                    }

                    $totalExisting = $returnOrder->details->where('variant_id', $variantId)->sum('quantity');
                    $allowed = $orderItem->quantity - $totalExisting;
                    $newQty = (int) $item['quantity'];

                    if ($newQty > $allowed) {
                        return response()->json([
                            'result' => false,
                            'message' => __('Return quantity exceeds ordered quantity for SKU :sku.', ['sku' => $variantId]),
                        ], 422);
                    }

                    $price = $item['price'] ?? $orderItem->price;
                    $refundAmount = $item['refund_amount'] ?? ($price * $newQty);

                    ReturnOrderDetail::create([
                        'return_order_id' => $returnOrder->id,
                        'variant_id' => $variantId,
                        'quantity' => $newQty,
                        'price' => $price,
                        'refund_amount' => $refundAmount,
                    ]);
                }
            }

            $currentStatusKey = ReturnOrder::getStatusKey($returnOrder->status['name'] ?? '');

            if (!in_array($validated['status'], ReturnOrder::getStatusTransitions()[$currentStatusKey] ?? [])) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid status transition.'),
                ]);
            }

            if ((int) $validated['status'] === 1 && (int) $currentStatusKey !== 1) {
                $order = $returnOrder->order;

                if ($order) {
                    $order->update(['status' => 9]);

                    foreach ($returnOrder->details as $detail) {
                        $variant = $detail->variant;

                        // Get the first stock adjustment for this order detail
                        $firstAdjustment = StockAdjustment::where('variant_id', $variant->id)
                            ->where('reference_type', 'order_detail')
                            ->where('type', 'sale')
                            ->latest('created_at')
                            ->first();

                        if ($firstAdjustment) {
                            StockAdjustment::systemAdjust([
                                'variant_id' => $variant->id,
                                'warehouse_id' => $firstAdjustment->warehouse_id,
                                'type' => 'return',
                                'quantity' => $detail->quantity,
                                'cost_per_item' => $firstAdjustment->cost_per_item,
                                'reason' => __('Returned due to return order #:number', ['number' => $order->order_number]),
                                'reference_id' => $returnOrder->id,
                                'reference_type' => 'return_order',
                            ]);
                        }
                    }
                }
            }

            $timestampUpdates = [];
            switch ((int) $validated['status']) {
                case 1:
                    $timestampUpdates['approved_at'] = Carbon::now();
                    break;
                case 2:
                    $timestampUpdates['rejected_at'] = Carbon::now();
                    break;
                case 3:
                    $timestampUpdates['completed_at'] = Carbon::now();
                    break;
            }

            $returnOrder->update(array_merge(['status' => $validated['status']], $timestampUpdates));


            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Return order updated successfully.'),
                'return_order' => new ReturnOrderResource($returnOrder->fresh('details')),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update return order.'), $e);
        }
    }
}
