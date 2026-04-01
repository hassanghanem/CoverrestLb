<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Order extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'order_number',
        'client_id',
        'is_cart',
        'is_preorder',
        'address_id',
        'coupon_id',
        'coupon_value',
        'coupon_type',
        'address_info',
        'notes',
        'payment_method',
        'payment_status',
        'delivery_amount',
        'status',
        'source',
        'is_view',
        'created_by',
        'confirmed_at',
        'packed_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'returned_at',
    ];
    protected $dates = [
        'confirmed_at',
        'packed_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'returned_at',
    ];
    protected $casts = [
        'address_info' => 'array',
        'delivery_amount' => 'float',
        'is_cart' => 'boolean',
        'is_preorder' => 'boolean',
        'is_view' => 'boolean',
        'confirmed_at' => 'datetime',
        'packed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
    public function returnOrders()
    {
        return $this->hasMany(ReturnOrder::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Order');
    }

    public function getSubtotalAttribute()
    {
        $subtotal = $this->orderDetails->sum(function ($orderDetail) {
            return $orderDetail->getTotalAttribute();
        });

        return round($subtotal, 2);
    }

    /**
     * Subtotal of only coupon-eligible items (after per-item discount).
     */
    public function getCouponEligibleSubtotalAttribute()
    {
        $subtotal = $this->orderDetails->sum(function ($orderDetail) {
            $product = $orderDetail->variant?->product;

            // If product exists and is explicitly marked as not coupon-eligible, skip it
            if ($product && $product->coupon_eligible === false) {
                return 0;
            }

            return $orderDetail->getTotalAttribute();
        });

        return round($subtotal, 2);
    }

    public function getGrandTotalAttribute()
    {
        $subtotal = $this->subtotal ?? 0;
        $eligibleSubtotal = $this->coupon_eligible_subtotal ?? $subtotal;
        $delivery_amount = $this->delivery_amount ?? 0;
        $discount = 0;

        if ($this->coupon_value && $this->coupon_type) {
            if ($this->coupon_type === 'fixed') {
                // Never discount more than the eligible subtotal
                $discount = min($this->coupon_value, $eligibleSubtotal);
            } elseif ($this->coupon_type === 'percentage') {
                $discount = ($eligibleSubtotal * $this->coupon_value) / 100;
            }
        }

        $grandTotal = $subtotal - $discount + $delivery_amount;

        return round(max($grandTotal, 0), 2);
    }



    protected function status(): Attribute
    {
        return new Attribute(
            get: function ($value) {
                $statuses = $this->getAllOrderStatus();

                return $statuses[$value] ?? null;
            },
        );
    }

    public static function getAllOrderStatus()
    {
        return [
            [ //0
                'name' => __('Pending'),
                'description' => __('The order has been created but not yet confirmed.'),
                'color' => '#ffc107',
                'class' => 'warning',
            ],
            [ //1
                'name' => __('Confirmed'),
                'description' => __('The order has been confirmed and is awaiting processing.'),
                'color' => '#007bff',
                'class' => 'primary',
            ],
            [ //2
                'name' => __('Processing'),
                'description' => __('The order is being prepared and packed for shipment.'),
                'color' => '#17a2b8',
                'class' => 'info',
            ],
            [ //3
                'name' => __('On Hold'),
                'description' => __('The order is temporarily on hold due to an issue or request.'),
                'color' => '#6c757d',
                'class' => 'secondary',
            ],
            [ //4
                'name' => __('Shipped'),
                'description' => __('The order has been shipped and is on its way to the customer.'),
                'color' => '#6610f2',
                'class' => 'primary',
            ],
            [ //5
                'name' => __('Delivered'),
                'description' => __('The order has been successfully delivered to the customer.'),
                'color' => '#28a745',
                'class' => 'success',
            ],
            [ //6
                'name' => __('Failed'),
                'description' => __('The order could not be processed or delivered successfully.'),
                'color' => '#dc3545',
                'class' => 'danger',
            ],
            [ //7
                'name' => __('Cancelled By Admin'),
                'description' => __('The order was cancelled by the administrator.'),
                'color' => '#dc3545',
                'class' => 'danger',
            ],
            [ //8
                'name' => __('Cancelled By Customer'),
                'description' => __('The order was cancelled by the customer before fulfillment.'),
                'color' => '#dc3545',
                'class' => 'danger',
            ],
            [ //9
                'name' => __('Returned'),
                'description' => __('The order has been returned by the customer for a refund or replacement.'),
                'color' => '#17a2b8',
                'class' => 'info',
            ],
            [ //10
                'name' => __('Completed'),
                'description' => __('The order has been fully processed, delivered, and finalized.'),
                'color' => '#28a745',
                'class' => 'success',
            ],
        ];
    }


    public static function getPaymentStatus($key = null)
    {
        $statuses = [
            __('Pending'),   // Payment is awaiting confirmation
            __('Paid'),      // Payment has been successfully completed
            __('Failed'),    // Payment attempt was unsuccessful
            __('Refunded'),  // Payment has been refunded to the customer
        ];

        return is_null($key) ? $statuses : ($statuses[$key] ?? null);
    }


    public static function getStatusKey($statusValue)
    {
        $statuses = self::getAllOrderStatus();
        return array_search($statusValue, array_column($statuses, 'name'));
    }
    public const STATUS_TRANSITIONS = [
        0 => [0, 1, 7],
        1 => [1, 2, 3, 7],
        2 => [2, 3, 4, 7],
        3 => [3, 2, 7],
        4 => [4, 5, 6, 7],
        5 => [5, 10],
        6 => [6, 7],
        7 => [7],
        8 => [8],
        9 => [9],
        10 => [10],
    ];

    public const SOURCES = [
        'website',
        'facebook',
        'whatsapp',
        'instagram',
    ];

    public function canTransitionTo(int $newStatus): bool
    {
        $current = $this->getStatusKey($this->status['name']);
        return in_array($newStatus, self::STATUS_TRANSITIONS[$current] ?? []);
    }


    public const PAYMENT_STATUS_TRANSITIONS = [
        0 => [0, 1, 2], // Pending -> Pending, Paid, Failed
        1 => [1],       // Paid -> Paid
        2 => [2, 1],    // Failed -> Failed, Paid
        3 => [3],       // Refunded -> Refunded
    ];

    public function canTransitionPaymentTo(int $newStatus): bool
    {
        $current = (int) $this->payment_status;
        return in_array($newStatus, self::PAYMENT_STATUS_TRANSITIONS[$current] ?? []);
    }
    public static function generateOrderNumber(): string
    {
        $year = now()->year;
        $start = 100000; // starting sequence

        // Get last order number for this year
        $lastOrder = Order::whereYear('created_at', $year)
            ->orderByDesc('id')
            ->value('order_number');

        // Extract sequence number from last order number
        if ($lastOrder && preg_match('/-(\d+)$/', $lastOrder, $matches)) {
            $nextSequence = intval($matches[1]) + 1;
        } else {
            $nextSequence = $start;
        }

        return "ORD-{$year}-{$nextSequence}";
    }


    public static function validateAndPrepareProducts(array $products, float &$total): array
    {
        $validatedProducts = [];

        foreach ($products as $item) {
            $variant = Variant::with('product')->find($item['variant_id']);

            if (!$variant || !$variant->product) {
                throw new \Exception(__('Invalid product variant with SKU :sku', ['sku' => $item['variant_id']]));
            }

            $price = $variant->product->price;
            $discount = $variant->product->discount;
            $discountedPrice = $price - ($price * $discount / 100);
            $total += $discountedPrice * $item['quantity'];

            $validatedProducts[] = [
                'variant' => $variant,
                'quantity' => $item['quantity'],
                'price' => $price,
            ];
        }

        return $validatedProducts;
    }

    public static function applyCouponIfExists(?string $couponCode, float $eligibleTotal, ?Client $client = null): ?Coupon
    {
        if (!$couponCode) return null;

        $coupon = Coupon::where('code', $couponCode)->first();

        if (!$coupon) {
            throw new \Exception(__('Invalid coupon code'));
        }

        [$canUse, $reason] = $coupon->canBeUsed($client, $eligibleTotal);

        if (!$canUse) {
            // $reason is already translated in Coupon::canBeUsed()
            throw new \Exception($reason);
        }

        if ($coupon->min_order_amount !== null && $eligibleTotal < $coupon->min_order_amount) {
            throw new \Exception(__('Minimum order amount of :amount not met', ['amount' => $coupon->min_order_amount]));
        }

        return $coupon;
    }

    public function returnedQuantities(): array
    {
        if (!$this->relationLoaded('returnOrders')) {
            $this->load('returnOrders.details');
        }

        $quantities = [];

        foreach ($this->returnOrders as $returnOrder) {
            // Use raw status integer, not transformed object
            if ((int)$returnOrder->getAttribute('status') !== 1) {
                continue;
            }

            foreach ($returnOrder->details as $detail) {
                $variantId = $detail->variant_id;
                $quantities[$variantId] = ($quantities[$variantId] ?? 0) + $detail->quantity;
            }
        }

        return $quantities;
    }
    public function getDeliveryDurationAttribute()
    {
        return $this->delivered_at && $this->shipped_at
            ? $this->delivered_at->diffInHours($this->shipped_at)
            : null;
    }

    public function getShippingDurationAttribute()
    {
        return $this->shipped_at && $this->placed_at
            ? $this->shipped_at->diffInHours($this->placed_at)
            : null;
    }
}
