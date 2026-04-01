<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\PreOrderRequest;
use App\Http\Resources\V1\Admin\OrderResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Address;
use App\Models\Configuration;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\StockAdjustment;
use App\Models\Client;
use App\Models\Coupon;
use App\Services\OrderNotificationService;
use App\Services\CostCalculatorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use App\Exceptions\ValidationException as CustomValidationException;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\BusinessLogicException;
use Exception;

class PreOrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,order_number,status,client_name,subtotal,delivery_amount,coupon_value,grand_total,payment_method,payment_status',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ]);

            $query = Order::with(['client', 'coupon', 'address'])
                ->where('is_cart', false)
                ->where('is_preorder', true)
                ->when($validated['search'] ?? null, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('orders.order_number', 'like', "%$search%")
                            ->orWhereHas('client', function ($clientQuery) use ($search) {
                                $clientQuery->where('name', 'like', "%$search%")
                                    ->orWhere('email', 'like', "%$search%");
                            });
                    });
                })
                ->when($validated['sort'] ?? null, function ($query, $sort) use ($validated) {
                    $order = $validated['order'] ?? 'desc';

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
                }, function ($query) {
                    $query->orderBy('orders.created_at', 'desc');
                });

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
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve order data.'), $e);
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

    public function store(PreOrderRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            $total = 0;
            $validatedProducts = [];

            // Validate products and check stock using totalStock()
            foreach ($data['products'] as $item) {
                $variant = \App\Models\Variant::with(['product', 'stockAdjustments'])->find($item['variant_id']);

                if (!$variant || !$variant->product) {
                    throw new CustomValidationException(__('Invalid variant with SKU :sku.', ['sku' => $item['variant_id']]));
                }

                // Pre-orders don't require stock check - customers can order out-of-stock items
                $price = $variant->product->price;
                $discount = $variant->product->discount;
                $discountedPrice = $price - ($price * $discount / 100);
                $total += $discountedPrice * $item['quantity'];

                // Track total for coupon-eligible items only
                $product = $variant->product;
                if (!isset($couponEligibleTotal)) {
                    $couponEligibleTotal = 0;
                }
                if (!$product || $product->coupon_eligible !== false) {
                    $couponEligibleTotal += $discountedPrice * $item['quantity'];
                }

                $validatedProducts[] = [
                    'variant' => $variant,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'discount' => $discount,
                ];
            }

            // Coupon logic
            $coupon = null;
            if (!empty($data['coupon_code'])) {
                $client = !empty($data['client_id']) ? Client::find($data['client_id']) : null;
                $coupon = Order::applyCouponIfExists($data['coupon_code'], $couponEligibleTotal ?? 0, $client);
            }

            $address = Address::find($data['address_id']);
            $data['address_info'] = $address ? $address->toArray() : null;
            $data['order_number'] = Order::generateOrderNumber();
            $data['delivery_amount'] = (float) Configuration::where('key', 'delivery_charge')->value('value');
            $data['is_cart'] = false;
            $data['is_preorder'] = true;
            $data['created_by'] = Auth::id();

            if ($coupon) {
                $data['coupon_id'] = $coupon->id;
                $data['coupon_value'] = $coupon->value;
                $data['coupon_type'] = $coupon->type;
            }

            $order = Order::create(Arr::except($data, ['coupon_code', 'products']));

            // Create order details
            foreach ($validatedProducts as $item) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'variant_id' => $item['variant']->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'],
                ]);
            }

            if ($coupon) {
                $coupon->increment('usage_count');
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Order created successfully.'),
                'order' => new OrderResource($order),
            ]);
        } catch (CustomValidationException|InsufficientStockException $e) {
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
            'convert_to_order' => 'nullable|integer|between:0,1',
            'payment_method' => 'nullable|string|max:191',
            'payment_status' => 'nullable|integer|between:0,3',
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
        ], [
            'address_id.exists' => __('The selected address is invalid.'),
            'order_details.*.id.exists' => __('One or more order items do not exist.'),
            'order_details.*.variant_id.required_without' => __('Variant is required when item id is not provided.'),
            'order_details.*.variant_id.exists' => __('One or more variants do not exist.'),
            'order_details.*.quantity.required_without' => __('Quantity is required when item id is not provided.'),
            'order_details.*.quantity.min' => __('Quantity must be at least 1.'),
            'order_details.*.price.min' => __('Price must be at least 0.'),
            'order_details.*.discount.max' => __('Discount cannot exceed 100.'),
        ]);

        try {
            DB::beginTransaction();

            $order = Order::with([
                'orderDetails.variant.stockAdjustments', // updated from stocks
                'orderDetails.variant.product',
                'client',
            ])->findOrFail($id);
            $oldCouponId = $order->coupon_id;

            // Update base fields (skip order_details, coupon_code and convert_to_order flag)
            $baseUpdate = Arr::except($validated, ['convert_to_order', 'order_details', 'coupon_code']);

            // If address_id is being changed, refresh the embedded address_info snapshot
            if (array_key_exists('address_id', $validated) && !is_null($validated['address_id'])) {
                $address = Address::find($validated['address_id']);
                if ($address) {
                    $baseUpdate['address_info'] = $address->toArray();
                }
            }

            $order->update(array_filter($baseUpdate, fn($v) => !is_null($v)));

            // Update preorder items price/discount/quantity or add new ones
            if (!empty($validated['order_details'])) {
                $detailsById = $order->orderDetails->keyBy('id');

                foreach ($validated['order_details'] as $item) {
                    // Existing detail
                    if (!empty($item['id'])) {
                        /** @var OrderDetail|null $detail */
                        $detail = $detailsById[$item['id']] ?? null;
                        if (!$detail) {
                            continue;
                        }

                        $detail->update([
                            'quantity' => $item['quantity'] ?? $detail->quantity,
                            'price' => $item['price'] ?? $detail->price,
                            'discount' => $item['discount'] ?? $detail->discount,
                        ]);

                        continue;
                    }

                    // New detail
                    $variant = \App\Models\Variant::with('product')->find($item['variant_id'] ?? null);

                    if (!$variant || !$variant->product) {
                        throw new CustomValidationException(__('Invalid variant with SKU :sku.', ['sku' => $item['variant_id'] ?? '']));
                    }

                    OrderDetail::create([
                        'order_id' => $order->id,
                        'variant_id' => $variant->id,
                        'quantity' => (int) $item['quantity'],
                        'price' => $item['price'] ?? $variant->product->price,
                        'discount' => $item['discount'] ?? $variant->product->discount,
                    ]);
                }
            }

            // Handle coupon changes (apply, change, or remove)
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

            if (!empty($validated['convert_to_order']) && $order->is_preorder) {
                foreach ($order->orderDetails as $detail) {
                    $variant = $detail->variant;

                    if (!$variant || !$variant->product) {
                        throw new CustomValidationException(__('Invalid variant with SKU #:sku', ['sku' => $detail->variant_id]));
                    }

                    // Default warehouse to 1 for pre-order conversion
                    $warehouseId = 1;

                    StockAdjustment::deductForOrder($variant->id, $detail->quantity, [
                        'reason' => __('Converted Order #:order_number', ['order_number' => $order->order_number]),
                        'reference_id' => $detail->id,
                        'reference_type' => 'order_detail',
                    ], $warehouseId);

                    // Calculate and set cost using CostCalculatorService
                    $costCalculator = app(CostCalculatorService::class);
                    $cost = $costCalculator->getCost($variant->id, $detail->quantity);
                    $detail->update(['cost' => $cost]);
                }

                $order->update([
                    'is_preorder' => false,
                    'is_view' => false,
                ]);

                // ✅ Send email notification for preorder conversion
                $notificationService = new OrderNotificationService();
                $notificationService->sendPreorderConversionNotification($order);
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
        } catch (CustomValidationException $e) {
            DB::rollBack();
            return $this->errorResponse($e->getMessage(), $e);
        } catch (BusinessLogicException $e) {
            DB::rollBack();
            return $this->errorResponse($e->getMessage(), $e);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update order.'), $e);
        }
    }
}
