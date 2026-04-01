<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\OrderResource;
use App\Mail\OrderConfirmationMail;
use App\Mail\OrderNotificationMail;
use App\Models\Address;
use App\Models\Configuration;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\StockAdjustment;
use App\Services\CostCalculatorService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ClientCheckoutController extends Controller
{
    protected function getCart($request, $createIfNotExists = true)
    {
        $clientId = $request->user()->id;

        $cart = Order::where('client_id', $clientId)->where('is_cart', true)->first();

        if (!$cart && $createIfNotExists) {
            $cart = Order::create([
                'client_id' => $clientId,
                'is_cart' => true,
                'order_number' => Order::generateOrderNumber(),
                'delivery_amount' => Configuration::getValue("delivery_charge"),
            ]);
        }

        if ($cart) {
            $cart->load([
                'client',
                'coupon',
                'address',
                'orderDetails.variant.product.category',
                'orderDetails.variant.product.brand',
                'orderDetails.variant.product.images',
                'orderDetails.variant.color',
                'orderDetails.variant.size',
                'orderDetails.variant.images',
                'orderDetails.variant.product.tags',
                'orderDetails.variant.product.specifications',
            ]);
        }

        return $cart;
    }

    public function placeOrder(Request $request)
    {
        try {
            $validated = $request->validate([
                'notes' => 'nullable|string|max:255',
                'payment_method' => 'required|string|max:191',
                'source' => 'nullable|string|in:' . implode(',', Order::SOURCES),
                'address_id' => 'required|exists:addresses,id',
            ]);

            $cart = $this->getCart($request, false);

            if (!$cart || $cart->orderDetails->isEmpty()) {
                return response()->json([
                    'result' => false,
                    'message' => __('Your cart is empty.'),
                ]);
            }

            // 🧠 Identify if this is a preorder cart
            $isPreorder = $cart->is_preorder || $cart->orderDetails->contains(function ($detail) {
                return $detail->variant->product->availability_status !== 'available' || $detail->variant->available_quantity <= 0;
            });

            $total = 0;
            $outOfStockItems = [];

            foreach ($cart->orderDetails as $detail) {
                $product = $detail->variant->product;

                if (!$product) {
                    return response()->json([
                        'result' => false,
                        'message' => __('Invalid variant: :sku', ['sku' => $detail->variant_id]),
                    ]);
                }

                // 🧩 Skip stock check if preorder
                if (!$isPreorder) {
                    try {
                        StockAdjustment::checkVariantQty($detail->variant_id, $detail->quantity);
                    } catch (\Exception $e) {
                        $outOfStockItems[] = $e->getMessage();
                    }
                }

                $price = $detail->variant->price;
                $discount = $detail->variant->discount;
                $discountedPrice = $price - ($price * $discount / 100);
                $total += $discountedPrice * $detail->quantity;
            }

            if (!$isPreorder && !empty($outOfStockItems)) {
                return response()->json([
                    'result' => false,
                    'message' => implode(", ", $outOfStockItems),
                ]);
            }

            // Coupon checks
            if ($cart->coupon) {
                $user = $request->user();
                [$canUse, $reason] = $cart->coupon->canBeUsed($user, $total) ?? [false, __('Invalid coupon.')];

                if (!$canUse) {
                    return response()->json([
                        'result' => false,
                        'message' => $reason,
                    ]);
                }

                if ($cart->coupon->min_order_amount && $total < $cart->coupon->min_order_amount) {
                    return response()->json([
                        'result' => false,
                        'message' => __('Minimum order amount not met: :amount', ['amount' => $cart->coupon->min_order_amount]),
                    ]);
                }
            }

            DB::beginTransaction();

            // Update order info
            $cart->address_id = $validated['address_id'];
            $address = Address::find($validated['address_id']);
            $cart->address_info = $address?->toArray();
            $cart->notes = $validated['notes'] ?? null;
            $cart->is_cart = false;
            $cart->payment_method = $validated['payment_method'];
            $cart->payment_status = 0;
            $cart->is_preorder = $isPreorder; // ✅ Ensure preorder flag is stored
            $cart->source = Order::SOURCES[0];

            if ($cart->coupon) {
                $cart->coupon_id = $cart->coupon->id;
                $cart->coupon_value = $cart->coupon->value;
                $cart->coupon_type = $cart->coupon->type;
                if ($cart->coupon->coupon_type === 4) {
                    $cart->delivery_amount = 0;
                }
            } else {
                $cart->delivery_amount = (float) Configuration::where('key', 'delivery_charge')->value('value');
            }

            $cart->save();

            // Now that the order is finalized, consume one coupon usage (if any)
            if ($cart->coupon_id) {
                Coupon::where('id', $cart->coupon_id)->increment('usage_count');
                Coupon::autoUpdateCouponsStatus();
            }

            // Deduct stock for regular items only
            foreach ($cart->orderDetails as $detail) {
                if (!$isPreorder) {
                    // Default warehouse to 1 for client checkout
                    $warehouseId = 1;

                    StockAdjustment::deductForOrder($detail->variant_id, $detail->quantity, [
                        'reason' => 'Order #' . $cart->order_number,
                        'reference_id' => $detail->id,
                        'reference_type' => 'order_detail',
                    ], $warehouseId);

                    $costCalculator = app(CostCalculatorService::class);
                    $cost = $costCalculator->getCost($detail->variant_id, $detail->quantity);
                    $detail->cost = $cost;
                }

                $detail->price = $detail->variant->price;
                $detail->discount = $detail->variant->discount;
                $detail->save();
            }

            DB::commit();

            // Send email notifications
            try {
                // Send notification to admin
                $contactsEmail = config('mail.contacts');
                Mail::to($contactsEmail)->send(new OrderNotificationMail($cart));

                // Send confirmation to client
                if ($cart->client && $cart->client->email && $cart->client->order_updates) {
                    Mail::to($cart->client->email)->send(new OrderConfirmationMail($cart));
                }
            } catch (\Exception $e) {
                // Email sending failed, but continue with order processing
            }

            return response()->json([
                'result' => true,
                'message' => __('Order created successfully.'),
                'order' => new OrderResource($cart),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'result' => false,
                'message' => __('An error occurred: :error', ['error' => $e->getMessage()]),
                'error' => $e->getTraceAsString(),
            ], 500);
        }
    }
}
