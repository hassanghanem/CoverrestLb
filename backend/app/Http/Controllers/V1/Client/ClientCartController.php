<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Client\CartItemRequest;
use App\Http\Resources\V1\Client\CartResource;
use App\Http\Resources\V1\Client\ProductResource;
use App\Models\Configuration;
use App\Models\Order;
use App\Models\StockAdjustment;
use App\Models\Variant;
use App\Services\ProductService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientCartController extends Controller
{
    protected function getCart($request, $createIfNotExists = true, $is_preorder = false)
    {
        $clientId = $request->user()->id;

        $cart = Order::where('client_id', $clientId)->where('is_cart', true)->first();

        if (!$cart && $createIfNotExists) {
            $cart = Order::create([
                'client_id' => $clientId,
                'is_cart' => true,
                'is_preorder' => $is_preorder,
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

    public function index(Request $request)
    {
        try {
            $cart = $this->getCart($request, false);

            $relatedProducts = collect([]);

            if ($cart && $cart->orderDetails->isNotEmpty()) {

                // Collect product, category, brand, tag IDs from cart items
                $productIds = $cart->orderDetails->pluck('variant.product.id')->unique();
                $categoryIds = $cart->orderDetails->pluck('variant.product.category_id')->unique();
                $brandIds = $cart->orderDetails->pluck('variant.product.brand_id')->unique();

                $tagIds = collect();
                foreach ($cart->orderDetails as $detail) {
                    $tagIds = $tagIds->merge($detail->variant->product->tags->pluck('id'));
                }
                $tagIds = $tagIds->unique();

                // Query related products
                $relatedProductsQuery = ProductService::baseProductQuery()
                    ->whereNotIn('id', $productIds)
                    ->where(function ($query) use ($cart) {
                        if ($cart->is_preorder) {
                            // Preorder cart → show out_of_stock, pre_order, coming_soon
                            $query->whereIn('availability_status', ['out_of_stock', 'pre_order', 'coming_soon']);
                        } else {
                            // Regular cart → only available products
                            $query->where('availability_status', 'available');
                        }
                    })
                    ->where(function ($query) use ($categoryIds, $brandIds, $tagIds) {
                        $query->whereIn('category_id', $categoryIds)
                            ->orWhereIn('brand_id', $brandIds)
                            ->orWhereHas('tags', fn($q) => $q->whereIn('tag_id', $tagIds));
                    });

                $relatedProducts = $relatedProductsQuery->limit(8)->get();
            }


            return response()->json([
                'result' => true,
                'message' => __('Cart retrieved successfully.'),
                'cart' => $cart ? new CartResource($cart) : null,
                'related_products' => ProductResource::collection($relatedProducts),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }



    public function addOrUpdate(CartItemRequest $request)
    {
        DB::beginTransaction();

        try {
            $variant = Variant::with('product')->findOrFail($request->variant_id);
            $is_preorder = false;

            // Cannot add discontinued items
            if ($variant->product->availability_status === "discontinued") {
                return response()->json([
                    'result' => false,
                    'message' => __('Cannot add this item to cart.'),
                ]);
            }

            // Preorder if product is unavailable or stock is zero
            if ($variant->product->availability_status !== "available" || $variant->totalStock() <= 0) {
                $is_preorder = true;
            } else {
                // Check stock for regular items
                StockAdjustment::checkVariantQty($request->variant_id, $request->quantity);
            }

            $cart = $this->getCart($request, true, $is_preorder);
            $existingOrderDetails = $cart->orderDetails;

            // Prevent mixing preorder and regular items
            if ($existingOrderDetails->isNotEmpty()) {
                $cartHasPreorder = $existingOrderDetails->contains(
                    fn($detail) =>
                    $detail->variant->product->availability_status !== 'available' || $detail->variant->totalStock() <= 0
                );

                if (($cartHasPreorder && !$is_preorder) || (!$cartHasPreorder && $is_preorder)) {
                    return response()->json([
                        'result' => false,
                        'message' => __('Cannot mix preorder and regular items in the cart.'),
                    ]);
                }
            }

            // Check if the variant is already in the cart
            $orderDetail = $existingOrderDetails->where('variant_id', $request->variant_id)->first();

            if ($orderDetail) {
                $oldQty = $orderDetail->quantity;
                $orderDetail->quantity = $request->quantity;
                $orderDetail->save();

                $cart->refresh();

                // Coupon check
                if ($cart->coupon && $cart->coupon->min_order_amount > $cart->subtotal) {
                    $orderDetail->quantity = $oldQty;
                    $orderDetail->save();

                    return response()->json([
                        'result' => false,
                        'message' => __('Cart coupon minimum order amount not met.'),
                    ]);
                }
            } else {
                // Add new item
                $cart->orderDetails()->create([
                    'variant_id' => $request->variant_id,
                    'quantity'   => $request->quantity,
                    'price'      => $variant->price,
                    'discount'   => $variant->discount ?? 0,
                    'cost'       => 0,
                ]);
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Item added to cart successfully.'),
                'cart'    => new CartResource($cart->fresh()),
                's' => $variant->totalStock(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }



    public function remove(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|integer|exists:variants,id',
        ], [
            'variant_id.required' => __('The variant ID field is required.'),
            'variant_id.integer' => __('The variant ID must be an integer.'),
            'variant_id.exists' => __('The selected variant does not exist.'),
        ]);

        try {
            $cart = $this->getCart($request, false);

            $orderDetail = $cart->orderDetails()->where('variant_id', $request->variant_id)->first();

            if (!$orderDetail) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cart item not found.'),
                ], 404);
            }

            $eligibleSubtotal = $cart->coupon_eligible_subtotal;

            $product = optional($orderDetail->variant)->product;
            $detailTotal = $orderDetail->getTotalAttribute();

            // Only affect coupon minimum check if this item is coupon-eligible
            if (!$product || $product->coupon_eligible !== false) {
                $newEligibleSubtotal = $eligibleSubtotal - $detailTotal;
            } else {
                $newEligibleSubtotal = $eligibleSubtotal;
            }
            $isLastItem = $cart->orderDetails()->count() === 1;

            if (
                !$isLastItem &&
                $cart->coupon &&
                $cart->coupon->min_order_amount > $newEligibleSubtotal
            ) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cart coupon minimum order amount not met.'),
                ]);
            }

            $orderDetail->delete();

            if ($isLastItem) {
                $cart->delete();
                return response()->json([
                    'result' => true,
                    'message' => __('Item removed and cart deleted.'),
                ]);
            }

            return response()->json([
                'result' => true,
                'message' => __('Item removed from cart successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
