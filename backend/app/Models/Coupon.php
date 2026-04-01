<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Coupon extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'code',
        'type',
        'value',
        'usage_limit',
        'usage_count',
        'min_order_amount',
        'status',
        'coupon_type',
        'client_id',
        'valid_from',
        'valid_to',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'usage_limit' => 'integer',
        'usage_count' => 'integer',
        'valid_from' => 'datetime',
        'valid_to' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    public function orders()
    {
        return $this->hasMany(Order::class, 'coupon_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName(__('Coupon'));
    }

    public static function getAllCouponTypes($key = null)
    {
        $types = [
            __('All clients'),
            __('Specific users'),
            __('First time'),
            __('Order amount'),
            __('Free delivery'),
        ];

        return is_null($key) ? $types : ($types[$key] ?? null);
    }

    protected function status(): Attribute
    {
        return new Attribute(
            get: function ($value) {
                $statuses = $this->getAllCouponStatus();
                return $statuses[$value] ?? null;
            },
        );
    }

    public static function getAllCouponStatus()
    {
        return [
            [
                'key' => "0",
                'name' => __('PENDING'),
                'color' => '#ffc107',
                'class' => 'warning',
            ],
            [
                'key' => "1",
                'name' => __('ACTIVE'),
                'color' => '#198754',
                'class' => 'success',
            ],
            [
                'key' => "2",
                'name' => __('INACTIVE'),
                'color' => '#6c757d',
                'class' => 'secondary',
            ],
            [
                'key' => "3",
                'name' => __('EXPIRED'),
                'color' => '#dc3545',
                'class' => 'danger',
            ],
            [
                'key' => "4",
                'name' => __('USED'),
                'color' => '#0d6efd',
                'class' => 'primary',
            ],
            [
                'key' => "5",
                'name' => __('CANCELED'),
                'color' => '#6f42c1',
                'class' => 'dark',
            ],
        ];
    }

    public static function getStatusKey($statusValue)
    {
        $statuses = self::getAllCouponStatus();
        return array_search($statusValue, array_column($statuses, 'name'));
    }

    public function canBeUsed($user = null, $orderAmount = null)
    {
        $currentDate = Carbon::now();

        // 1. Status check
        if ($this->status['key'] != 1) {
            return [false, __('Coupon is inactive')];
        }

        // 2. Validity date check
        if ($this->valid_from && $this->valid_from->gt($currentDate)) {
            return [false, __('Coupon is not yet valid')];
        }

        if ($this->valid_to && $this->valid_to->lt($currentDate)) {
            return [false, __('Coupon has expired')];
        }

        // 3. Usage limit check
        if ($this->usage_limit !== null && $this->usage_count >= $this->usage_limit) {
            return [false, __('Coupon usage limit reached')];
        }

        // 4. Type-specific logic
        switch ($this->coupon_type) {
            case 0: // All clients
                // Always valid if general checks pass
                break;

            case 1: // Specific users
                if (!$user || $this->client_id != $user->id) {
                    return [false, __('This coupon is not assigned to you')];
                }
                break;

            case 2: // First time
                if (!$user || $user->orders()->count() > 0) {
                    return [false, __('This coupon is only valid for first-time orders')];
                }
                break;

            case 3: // Order amount
                if ($orderAmount === null || $orderAmount < $this->min_order_amount) {
                    return [false, __('Order amount does not meet the minimum required for this coupon')];
                }
                break;

            case 4: // Free delivery
                // Could be additional checks like delivery method
                break;

            default:
                return [false, __('Invalid coupon type')];
        }

        return [true, __('Coupon is valid')];
    }


    public static function autoUpdateCouponsStatus(): void
    {
        $now = Carbon::now();
        $coupons = Coupon::all();
        foreach ($coupons as $coupon) {
            $currentStatus = (int) self::getStatusKey($coupon->status);
            $newStatus = $currentStatus;
            if ($coupon->valid_to && $coupon->valid_to->lt($now)) {
                $newStatus = 3; // EXPIRED
            } elseif ($coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit) {
                $newStatus = 4; // USED
            } elseif (
                in_array($currentStatus, [3, 4]) &&
                (!$coupon->valid_to || $coupon->valid_to->gt($now)) &&
                ($coupon->usage_limit === null || $coupon->usage_count < $coupon->usage_limit)
            ) {
                $newStatus = 0; // PENDING
            }
            if ($newStatus !== $currentStatus) {
                $coupon->status = $newStatus;
                $coupon->save();
                activity('coupon')->performedOn($coupon)->log(__('Status auto-updated to :status', ['status' => $newStatus]));
            }
        }
    }
}
