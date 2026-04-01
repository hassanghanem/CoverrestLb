<?php
namespace App\Http\Controllers\V1\Client;


use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\CartResource;
use App\Http\Resources\V1\Client\CouponResource;
use App\Http\Resources\V1\Client\PaginationResource;
use App\Models\Configuration;
use App\Models\Coupon;
use App\Models\Order;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClientCouponController extends Controller
{
    protected function getCart(Request $request)
    {
        $clientId = $request->user()->id;

        return Order::where('client_id', $clientId)
            ->where('is_cart', true)
            ->first();
    }

    /**
     * List all available coupons for the client
     */
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,code,value,valid_from,valid_to,usage_count',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
                'coupon_type' => 'nullable|integer|in:0,1,2,3,4',
                'show_valid_only' => 'nullable|in:true,false,1,0',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
                'per_page.integer' => __('The per page must be an integer.'),
                'per_page.min' => __('The per page must be at least :min.'),
                'per_page.max' => __('The per page may not be greater than :max.'),
                'coupon_type.integer' => __('The coupon type must be an integer.'),
                'coupon_type.in' => __('The coupon type must be one of the following: :values.'),
                'show_valid_only.in' => __('The show valid only field must be true or false.'),
            ]);

            // Convert string boolean to actual boolean
            if (isset($validated['show_valid_only'])) {
                $validated['show_valid_only'] = filter_var($validated['show_valid_only'], FILTER_VALIDATE_BOOLEAN);
            }

            $clientId = $request->user()->id;
            $currentDate = now();

            // Check if client has any completed orders (not a cart)
            $hasOrder = Order::where('client_id', $clientId)
                ->where('is_cart', false)
                ->exists();

            $coupons = Coupon::query()
                ->where(function ($query) use ($clientId, $hasOrder) {
                    $query->where('coupon_type', 0) // All clients
                        ->orWhere(fn($q) => $q->where('coupon_type', 1)->where('client_id', $clientId)) // Specific user
                        ->orWhere(function ($q) use ($hasOrder) {
                            $q->whereIn('coupon_type', [2, 3, 4]); // First time, Order amount, Free delivery
                            // Exclude first time coupon if client has orders
                            if ($hasOrder) {
                                $q->where('coupon_type', '!=', 2);
                            }
                        });
                })
                ->when($validated['coupon_type'] ?? null, fn($q, $type) => $q->where('coupon_type', $type))
                ->when($validated['search'] ?? null, fn($q, $search) => $q->where('code', 'like', "%{$search}%"))
                ->when($validated['show_valid_only'] ?? false, function ($query) use ($currentDate) {
                    // Only apply filters if show_valid_only is true
                    $query->where('status', 1) // Active only
                        ->where(function ($q) use ($currentDate) {
                            $q->where(function ($subQ) use ($currentDate) {
                                $subQ->whereNull('valid_from')
                                    ->orWhere('valid_from', '<=', $currentDate);
                            })->where(function ($subQ) use ($currentDate) {
                                $subQ->whereNull('valid_to')
                                    ->orWhere('valid_to', '>=', $currentDate);
                            });
                        })
                        ->where(function ($q) {
                            $q->whereNull('usage_limit')
                                ->orWhereRaw('usage_count < usage_limit');
                        });
                })
                ->when(!($validated['sort'] ?? null), function ($query) use ($currentDate) {
                    // Default sorting: valid coupons first, then by created_at desc
                    $query->addSelect([
                        '*',
                        DB::raw("
                            CASE 
                                WHEN status = 1 
                                AND (valid_from IS NULL OR valid_from <= '{$currentDate}')
                                AND (valid_to IS NULL OR valid_to >= '{$currentDate}')
                                AND (usage_limit IS NULL OR usage_count < usage_limit)
                                THEN 1
                                ELSE 0
                            END as is_valid
                        ")
                    ])->orderBy('is_valid', 'desc')->orderBy('created_at', 'desc');
                })
                ->when($validated['sort'] ?? null, function ($query) use ($validated) {
                    $query->orderBy($validated['sort'], $validated['order'] ?? 'desc');
                })
                ->paginate($validated['per_page'] ?? 10);

            return response()->json([
                'result' => true,
                'message' => __('Coupons retrieved successfully.'),
                'coupons' => CouponResource::collection($coupons),
                'pagination' => new PaginationResource($coupons),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred while retrieving coupons.'), $e);
        }
    }

    /**
     * Apply a coupon to the client's cart
     */
    public function apply(Request $request)
    {
        $validated = $request->validate([
            'coupon_code' => 'required|string|exists:coupons,code',
        ]);

        DB::beginTransaction();

        try {
            $cart = $this->getCart($request);
            if (!$cart) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cart not found.'),
                ]);
            }

            $coupon = Coupon::where('code', $validated['coupon_code'])->first();
            if (!$coupon) {
                return response()->json([
                    'result' => false,
                    'message' => __('Coupon not found.'),
                ]);
            }

            $user = $request->user();
            $eligibleSubtotal = $cart->coupon_eligible_subtotal;
            [$canUse, $reason] = $coupon->canBeUsed($user, $eligibleSubtotal);

            if (!$canUse) {
                return response()->json([
                    'result' => false,
                    'message' => $reason,
                ]);
            }

            // Extra check: min order
            if ($coupon->min_order_amount && $eligibleSubtotal < $coupon->min_order_amount) {
                return response()->json([
                    'result' => false,
                    'message' => __('Minimum order amount not met: :amount', [
                        'amount' => $coupon->min_order_amount,
                    ]),
                ]);
            }

            // Apply coupon (do NOT change usage_count here; only finalized orders should consume usage)
            $cart->update([
                'coupon_id' => $coupon->id,
                'coupon_value' => $coupon->value,
                'coupon_type' => $coupon->type,
                'delivery_amount' => $coupon->coupon_type === 4 ? 0 : $cart->delivery_amount,
            ]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Coupon applied successfully.'),
                'cart' => new CartResource($cart),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred while applying coupon.'), $e);
        }
    }

    /**
     * Remove a coupon from the client's cart
     */
    public function remove(Request $request)
    {
        DB::beginTransaction();

        try {
            $cart = $this->getCart($request);

            if (!$cart) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cart not found.'),
                ]);
            }

            if (!$cart->coupon_id) {
                return response()->json([
                    'result' => false,
                    'message' => __('No coupon applied.'),
                ]);
            }

            $cart->update([
                'coupon_id' => null,
                'coupon_value' => null,
                'coupon_type' => null,
                'delivery_amount' => Configuration::getValue('delivery_charge'),
            ]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Coupon removed successfully.'),
                'cart' => new CartResource($cart),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred while removing coupon.'), $e);
        }
    }
}
