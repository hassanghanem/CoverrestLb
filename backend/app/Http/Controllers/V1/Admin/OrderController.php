<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\OrderRequest;
use App\Http\Resources\V1\Admin\OrderResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Address;
use App\Models\Configuration;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\StockAdjustment;
use App\Models\Variant;
use App\Models\Client;
use App\Services\OrderNotificationService;
use App\Services\CostCalculatorService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ValidationException as CustomValidationException;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\BusinessLogicException;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,order_number,status,client_name,subtotal,delivery_amount,coupon_value,grand_total,payment_method,payment_status',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $sort = $validated['sort'] ?? 'created_at';
            $order = $validated['order'] ?? 'desc';

            $query = Order::query()
                ->with([
                    'client',
                    'coupon',
                    'address',
                    'orderDetails.variant.product',
                    'orderDetails.variant.color',
                    'orderDetails.variant.size',
                ])
                ->where('is_cart', false)
                ->where('is_preorder', false)
                ->when($validated['search'] ?? null, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('orders.order_number', 'like', "%$search%")
                            ->orWhereHas('client', function ($clientQuery) use ($search) {
                                $clientQuery->where('name', 'like', "%$search%")
                                    ->orWhere('email', 'like', "%$search%");
                            });
                    });
                });

            if ($sort === 'client_name') {
                $query->join('clients', 'orders.client_id', '=', 'clients.id')
                    ->orderBy('clients.name', $order)
                    ->select('orders.*');
            } elseif ($sort === 'subtotal') {
                $direction = $order === 'asc' ? 'asc' : 'desc';
                $query->orderByRaw('(
                    SELECT COALESCE(SUM(price * quantity * (1 - (discount / 100))), 0)
                    FROM order_details
                    WHERE order_details.order_id = orders.id
                ) ' . $direction);
            } elseif ($sort === 'grand_total') {
                $direction = $order === 'asc' ? 'asc' : 'desc';
                $query->orderByRaw('(
                    SELECT COALESCE(SUM(price * quantity * (1 - (discount / 100))), 0) - (
                            CASE
                                WHEN orders.coupon_value IS NOT NULL AND orders.coupon_type = "fixed" THEN orders.coupon_value
                                WHEN orders.coupon_value IS NOT NULL AND orders.coupon_type = "percentage" THEN (COALESCE(SUM(price * quantity * (1 - (discount / 100))), 0) * orders.coupon_value / 100)
                                ELSE 0
                            END
                        ) + COALESCE(orders.delivery_amount, 0)
                ) ' . $direction);
            } else {
                $query->orderBy("orders.$sort", $order);
            }

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $orders = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Orders retrieved successfully.'),
                'orders' => OrderResource::collection($orders),
                'pagination' => new PaginationResource($orders),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve orders.'), $e);
        }
    }

    public function show(Order $order)
    {
        $order->load([
            'client',
            'coupon',
            'address',
            'orderDetails.variant.product',
            'orderDetails.variant.color',
            'orderDetails.variant.size',
            'orderDetails.stockAdjustments' => function ($query) {
                $query->where('reference_type', 'order_detail')
                    ->where('type', 'sale')
                    ->latest('created_at')
                    ->limit(1);
            },
            'orderDetails.stockAdjustments.warehouse',
        ]);

        if (!$order->is_view) {
            $order->is_view = true;
            $order->update();
        }

        return response()->json([
            'result' => true,
            'message' => __('Order found successfully.'),
            'order' => new OrderResource($order),
        ]);
    }
    public function store(OrderRequest $request)
    {
        $data = $request->validated();
        $total = 0;
        $couponEligibleTotal = 0;
        $validatedProducts = [];
        $costCalculator = app(CostCalculatorService::class);

        try {
            DB::beginTransaction();

            // Validate products, calculate total, and check stock
            foreach ($data['products'] as $item) {
                $variant = Variant::with(['product', 'stockAdjustments'])->find($item['variant_id']);

                if (!$variant || !$variant->product) {
                    throw new CustomValidationException(__('Invalid variant with SKU :sku.', ['sku' => $item['variant_id']]));
                }

                // Check stock availability using totalStock()
                if ($variant->totalStock() < $item['quantity']) {
                    throw new InsufficientStockException(__('Insufficient stock for SKU :sku. Available quantity: :available', [
                        'sku' => $variant->display_sku,
                        'available' => $variant->totalStock(),
                    ]));
                }

                $price = $variant->product->price;
                $discount = $variant->product->discount;
                $discountedPrice = $price - ($price * $discount / 100);
                $total += $discountedPrice * $item['quantity'];

                $product = $variant->product;
                if (!$product || $product->coupon_eligible !== false) {
                    $couponEligibleTotal += $discountedPrice * $item['quantity'];
                }

                $cost = $costCalculator->getCost($variant->id, $item['quantity']);

                $validatedProducts[] = [
                    'variant' => $variant,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'discount' => $discount,
                    'cost' => $cost,
                ];
            }

            // Coupon logic
            if (!empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', $data['coupon_code'])->first();
                $client = !empty($data['client_id']) ? Client::find($data['client_id']) : null;

                [$canUse, $reason] = $coupon?->canBeUsed($client, $couponEligibleTotal) ?? [false, __('Invalid coupon.')];

                if (!$canUse) {
                    throw new BusinessLogicException($reason);
                }

                if ($coupon->min_order_amount && $couponEligibleTotal < $coupon->min_order_amount) {
                    throw new BusinessLogicException(__('Minimum order amount of :amount not met.', ['amount' => $coupon->min_order_amount]));
                }

                $data['coupon_id'] = $coupon->id;
                $data['coupon_value'] = $coupon->value;
                $data['coupon_type'] = $coupon->type;
                $coupon->increment('usage_count');

                if ($coupon->type === 4) { // Free delivery coupon
                    $data['delivery_amount'] = 0;
                }
            }

            // Address and order info
            $address = Address::find($data['address_id']);
            $data['address_info'] = $address?->toArray();
            $data['order_number'] = Order::generateOrderNumber();
            $data['delivery_amount'] = $data['delivery_amount'] ?? (float) Configuration::where('key', 'delivery_charge')->value('value');
            $data['is_cart'] = false;
            $data['created_by'] = Auth::id();

            // Create order
            $order = Order::create(Arr::except($data, ['coupon_code', 'products']));

            // Deduct stock and create order details
            foreach ($validatedProducts as $item) {
                // Create order detail first to get its ID for reference
                $orderDetail = OrderDetail::create([
                    'order_id' => $order->id,
                    'variant_id' => $item['variant']->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'],
                    'cost' => $item['cost'],
                ]);

                // Default to warehouse 1 if not specified
                $warehouseId = $item['warehouse_id'] ?? 1;

                StockAdjustment::deductForOrder($item['variant']->id, $item['quantity'], [
                    'reason' => 'Order #' . $order->order_number,
                    'reference_id' => $orderDetail->id,
                    'reference_type' => 'order_detail',
                ], $warehouseId);
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Order created successfully.'),
                'order' => new OrderResource($order),
            ]);
        } catch (CustomValidationException | InsufficientStockException | BusinessLogicException $e) {
            DB::rollBack();
            return $this->errorResponse($e->getMessage(), $e);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create order.'), $e);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'nullable|integer|min:0|max:10',
            'payment_method' => 'nullable|string|max:191',
            'payment_status' => 'nullable|integer|between:0,3',
            'source' => 'nullable|string|in:' . implode(',', Order::SOURCES),
            'address_id' => 'nullable|integer|exists:addresses,id',
            'coupon_code' => 'nullable|string|exists:coupons,code',
            'notes' => 'nullable|string|max:255',
            'delivery_amount' => 'nullable|numeric|min:0',
            'order_details' => 'nullable|array',
            'order_details.*.id' => 'nullable|integer|exists:order_details,id',
            'order_details.*.variant_id' => 'required_without:order_details.*.id|integer|exists:variants,id',
            'order_details.*.quantity' => 'required_without:order_details.*.id|integer|min:1',
            'order_details.*.price' => 'nullable|numeric|min:0',
            'order_details.*.discount' => 'nullable|integer|min:0|max:100',
            'order_details.*.cost_price' => 'nullable|numeric|min:0',
            'order_details.*.warehouse_id' => 'nullable|integer|exists:warehouses,id',
            'send_notification_email' => 'nullable|boolean',
        ], [
            'status.min' => __('Status must be at least :min.'),
            'status.max' => __('Status may not be greater than :max.'),
            'payment_status.between' => __('Payment status must be between :min and :max.'),
            'address_id.exists' => __('The selected address is invalid.'),
            'order_details.*.id.exists' => __('One or more order items do not exist.'),
            'order_details.*.variant_id.required_without' => __('Variant is required when item id is not provided.'),
            'order_details.*.variant_id.exists' => __('One or more variants do not exist.'),
            'order_details.*.quantity.required_without' => __('Quantity is required when item id is not provided.'),
            'order_details.*.quantity.min' => __('Quantity must be at least 1.'),
            'order_details.*.price.min' => __('Price must be at least 0.'),
            'order_details.*.discount.max' => __('Discount cannot exceed 100.'),
            'order_details.*.cost_price.min' => __('Cost price must be at least 0.'),
            'order_details.*.warehouse_id.exists' => __('One or more warehouses do not exist.'),
        ]);

        try {
            DB::beginTransaction();

            $order = Order::with(['orderDetails.variant', 'client'])->findOrFail($id);
            $oldCouponId = $order->coupon_id;
            $oldStatus = $order->status;
            $currentStatusId = (int) $order->getRawOriginal('status');

            // Get the old status key for notification service
            $oldStatusKey = null;
            if ($oldStatus) {
                foreach (Order::getAllOrderStatus() as $key => $status) {
                    if ($status['name'] === $oldStatus['name']) {
                        $oldStatusKey = $key;
                        break;
                    }
                }
            }
            $timestampsToUpdate = [];

            // ✅ Handle order status transitions
            if (isset($validated['status'])) {
                $newStatus = $validated['status'];

                if ($newStatus !== $oldStatus && !$order->canTransitionTo($newStatus)) {
                    throw new BusinessLogicException(__('Invalid status transition.'));
                }

                switch ($newStatus) {

                    case 1:
                        $timestampsToUpdate['confirmed_at'] = Carbon::now();
                        break;
                    case 2:
                        $timestampsToUpdate['packed_at'] = Carbon::now();
                        break;
                    case 4:
                        $timestampsToUpdate['shipped_at'] = Carbon::now();
                        break;
                    case 5:
                        $timestampsToUpdate['delivered_at'] = Carbon::now();
                        break;
                    case 7:
                    case 8:
                        $timestampsToUpdate['cancelled_at'] = Carbon::now();
                        break;
                    case 9:
                        $timestampsToUpdate['returned_at'] = Carbon::now();
                        break;
                }
            }

            // ✅ Update order base fields (excluding order_details & coupon_code)
            $baseUpdate = Arr::except($validated, ['order_details', 'coupon_code']);

            // If address_id is being changed, refresh the embedded address_info snapshot
            if (array_key_exists('address_id', $validated) && !is_null($validated['address_id'])) {
                $address = Address::find($validated['address_id']);
                if ($address) {
                    $baseUpdate['address_info'] = $address->toArray();
                }
            }
            $order->update(array_merge(
                array_filter($baseUpdate, fn($v) => !is_null($v)),
                $timestampsToUpdate
            ));

            // ✅ Update order items price/discount/quantity
            if (!empty($validated['order_details'])) {
                // Map details by id for quick lookup
                $detailsById = $order->orderDetails->keyBy('id');
                $terminalStatuses = [7, 8, 9];
                $processedIds = [];

                foreach ($validated['order_details'] as $item) {
                    // Update existing item
                    if (!empty($item['id'])) {
                        /** @var OrderDetail|null $detail */
                        $detail = $detailsById[$item['id']] ?? null;
                        if (!$detail) {
                            continue; // skip invalid ids, already validated
                        }

                        $processedIds[] = $detail->id;

                        $variant = $detail->variant;
                        $oldQty = (int) $detail->quantity;
                        $newQty = isset($item['quantity']) ? (int) $item['quantity'] : $oldQty;

                        $oldPrice = $detail->price;
                        $newPrice = $item['price'] ?? $oldPrice;

                        $oldDiscount = $detail->discount;
                        $newDiscount = $item['discount'] ?? $oldDiscount;

                        // Stock adjustments only if quantity changed and order is not in a terminal state
                        if ($newQty !== $oldQty && !in_array($currentStatusId, $terminalStatuses)) {
                            $delta = $newQty - $oldQty;
                            $warehouseId = $item['warehouse_id'] ?? 1; // Warehouse is required, but default to 1 if missing

                            if ($delta > 0) {
                                // Ensure stock is available in the specified warehouse
                                $warehouseStock = Variant::find($detail->variant_id)->totalStock();
                                if ($warehouseStock < $delta) {
                                    throw new InsufficientStockException(__('Insufficient stock for SKU :sku. Available quantity: :available', [
                                        'sku' => $variant->display_sku,
                                        'available' => $warehouseStock,
                                    ]));
                                }

                                StockAdjustment::deductForOrder($detail->variant_id, $delta, [
                                    'reason' => __('Order # :order quantity increase', ['order' => $order->order_number]),
                                    'reference_id' => $detail->id,
                                    'reference_type' => 'order_detail',
                                ], $warehouseId);
                            } else {
                                // Return excess stock
                                StockAdjustment::systemAdjust([
                                    'variant_id' => $detail->variant_id,
                                    'warehouse_id' => $warehouseId,
                                    'type' => 'return',
                                    'quantity' => abs($delta),
                                    'cost_per_item' => $detail->cost ?? 0,
                                    'reason' => __('Order # :order quantity decrease', ['order' => $order->order_number]),
                                    'reference_id' => $detail->id,
                                    'reference_type' => 'order_detail',
                                ]);
                            }
                        }

                        // Calculate cost using CostCalculatorService
                        $costCalculator = app(CostCalculatorService::class);
                        $cost = $item['cost_price'] ?? $costCalculator->getCost($detail->variant_id, $newQty);
                        $detail->update([
                            'quantity' => $newQty,
                            'price' => $newPrice,
                            'discount' => $newDiscount,
                            'cost' => $cost,
                        ]);

                        continue;
                    }

                    // Create new item
                    $variant = Variant::with(['product', 'stockAdjustments'])->find($item['variant_id'] ?? null);

                    if (!$variant || !$variant->product) {
                        throw new CustomValidationException(__('Invalid variant with SKU :sku.', ['sku' => $item['variant_id'] ?? '']));
                    }

                    $newQty = (int) $item['quantity'];
                    $newPrice = $item['price'] ?? $variant->product->price;
                    $newDiscount = $item['discount'] ?? $variant->product->discount;
                    $warehouseId = $item['warehouse_id'] ?? 1; // Warehouse is required in validation
                    $costCalculator = app(CostCalculatorService::class);
                    $cost = $item['cost_price'] ?? $costCalculator->getCost($variant->id, $newQty);

                    if (!in_array($currentStatusId, $terminalStatuses)) {
                        if ($variant->totalStock() < $newQty) {
                            throw new InsufficientStockException(__('Insufficient stock for SKU :sku. Available quantity: :available', [
                                'sku' => $variant->display_sku,
                                'available' => $variant->totalStock(),
                            ]));
                        }

                        // Create order detail first to get its ID for reference
                        $orderDetail = OrderDetail::create([
                            'order_id' => $order->id,
                            'variant_id' => $variant->id,
                            'quantity' => $newQty,
                            'price' => $newPrice,
                            'discount' => $newDiscount,
                            'cost' => $cost,
                        ]);

                        StockAdjustment::deductForOrder($variant->id, $newQty, [
                            'reason' => __('Order # :order new item added', ['order' => $order->order_number]),
                            'reference_id' => $orderDetail->id,
                            'reference_type' => 'order_detail',
                        ], $warehouseId);

                        continue;
                    }
                }

                // ✅ Remove items not in the request (deletion)
                if (!in_array($currentStatusId, $terminalStatuses)) {
                    foreach ($detailsById as $detail) {
                        if (!in_array($detail->id, $processedIds)) {
                            // Return stock for removed item
                            $adjustments = StockAdjustment::where([
                                ['variant_id', '=', $detail->variant_id],
                                ['reference_id', '=', $detail->id],
                                ['reference_type', '=', 'order_detail'],
                                ['type', '=', 'sale'],
                            ])->latest()->get();

                            foreach ($adjustments as $adj) {
                                StockAdjustment::systemAdjust([
                                    'variant_id'     => $adj->variant_id,
                                    'warehouse_id'   => $adj->warehouse_id,
                                    'type'           => 'return',
                                    'quantity'       => $adj->quantity,
                                    'cost_per_item'  => $adj->cost_per_item,
                                    'reason'         => __('Stock returned due to item removal from Order #:order', ['order' => $order->order_number]),
                                    'reference_id'   => $detail->id,
                                    'reference_type' => 'order_detail',
                                ]);
                            }

                            $detail->delete();
                        }
                    }
                }
            }

            // ✅ Handle coupon changes (apply, change, or remove)
            if (array_key_exists('coupon_code', $validated)) {
                $newCouponCode = $validated['coupon_code'];

                // Revert previous coupon usage if there was one
                if ($oldCouponId) {
                    $previousCoupon = Coupon::find($oldCouponId);
                    if ($previousCoupon) {
                        $previousCoupon->decrement('usage_count');
                    }
                }

                if ($newCouponCode) {
                    $coupon = Coupon::where('code', $newCouponCode)->first();

                    // Validate against current client and coupon-eligible subtotal
                    $order->loadMissing(['client', 'orderDetails']);
                    $eligibleSubtotal = $order->coupon_eligible_subtotal ?? 0;

                    [$canUse, $reason] = $coupon?->canBeUsed($order->client, $eligibleSubtotal) ?? [false, __('Invalid coupon.')];

                    if (!$canUse) {
                        throw new BusinessLogicException($reason);
                    }

                    if ($coupon->min_order_amount && $eligibleSubtotal < $coupon->min_order_amount) {
                        throw new BusinessLogicException(__('Minimum order amount of :amount not met.', ['amount' => $coupon->min_order_amount]));
                    }

                    $order->coupon_id = $coupon->id;
                    $order->coupon_value = $coupon->value;
                    $order->coupon_type = $coupon->type;

                    // Free delivery coupon
                    if ($coupon->type === 4) {
                        $order->delivery_amount = 0;
                    }

                    $coupon->increment('usage_count');
                } else {
                    // Coupon removed
                    $order->coupon_id = null;
                    $order->coupon_value = null;
                    $order->coupon_type = null;
                }

                $order->save();
            }

            // ✅ Handle stock return if cancelled
            if (isset($validated['status']) && $validated['status'] !== $oldStatus) {
                $newStatus = $validated['status'];
                $canceledStatuses = [7];

                if (in_array($newStatus, $canceledStatuses) && !in_array($oldStatus, $canceledStatuses)) {
                    foreach ($order->orderDetails as $detail) {
                        $adjustments = StockAdjustment::where([
                            ['variant_id', '=', $detail->variant_id],
                            ['reference_id', '=', $detail->id],
                            ['reference_type', '=', 'order_detail'],
                            ['type', '=', 'sale'],
                        ])->latest()->get();

                        foreach ($adjustments as $adj) {
                            StockAdjustment::systemAdjust([
                                'variant_id'     => $adj->variant_id,
                                'warehouse_id'   => $adj->warehouse_id,
                                'type'           => 'return',
                                'quantity'       => $adj->quantity,
                                'cost_per_item'  => $adj->cost_per_item,
                                'reason'         => __('Stock returned due to cancellation of Order #:order', ['order' => $order->order_number]),
                                'reference_id'   => $detail->id,
                                'reference_type' => 'order_detail',
                            ]);
                        }
                    }
                }
            }

            if (isset($validated['status']) && $validated['status'] !== $oldStatusKey && $validated['send_notification_email'] === true) {
                $notificationService = new OrderNotificationService();
                $notificationService->sendStatusUpdateNotification($order->fresh(['client']), $oldStatusKey);
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Order updated successfully.'),
                'order' => new OrderResource($order->fresh([
                    'client',
                    'coupon',
                    'address',
                    'orderDetails.variant.product',
                    'orderDetails.variant.color',
                    'orderDetails.variant.size',
                    'orderDetails.stockAdjustments' => function ($query) {
                        $query->where('reference_type', 'order_detail')
                            ->where('type', 'sale')
                            ->latest('created_at')
                            ->limit(1);
                    },
                    'orderDetails.stockAdjustments.warehouse',
                ])),
            ]);
        } catch (BusinessLogicException $e) {
            DB::rollBack();
            return $this->errorResponse($e->getMessage(), $e);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update order.'), $e);
        }
    }

    /**
     * Display a printer-friendly receipt for the given order.
     */
    public function receipt(Order $order)
    {
        $order->load([
            'client',
            'coupon',
            'address',
            'orderDetails.variant.product',
            'orderDetails.variant.color',
            'orderDetails.variant.size',
        ]);

        return response()
            ->view('admin.orders.receipt', [
                'order' => $order,
            ]);
    }
}
