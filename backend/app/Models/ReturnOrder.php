<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ReturnOrder extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'order_id',
        'client_id',
        'return_order_number',
        'status',
        'reason',
        'created_by',
        'rejected_at',
        'approved_at',
        'completed_at',
    ];

    protected $casts = [
        'rejected_at' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details()
    {
        return $this->hasMany(ReturnOrderDetail::class);
    }

    public function getTotalRefundAmountAttribute()
    {
        return $this->details->sum('refund_amount');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName(__('Return Order'));
    }

    protected function status(): Attribute
    {
        return new Attribute(
            get: fn($value) => $this->getAllReturnStatuses()[$value] ?? null,
        );
    }

    public static function getAllReturnStatuses()
    {
        return [
            0 => [
                'name' => __('Requested'),
                'description' => __('The return request has been submitted by the customer and is awaiting review.'),
                'color' => '#ffc107',
                'class' => 'warning',
            ],
            1 => [
                'name' => __('Approved'),
                'description' => __('The return request has been approved and is being processed.'),
                'color' => '#28a745',
                'class' => 'success',
            ],
            2 => [
                'name' => __('Rejected'),
                'description' => __('The return request has been rejected due to invalid reasons or conditions.'),
                'color' => '#dc3545',
                'class' => 'danger',
            ],
            3 => [
                'name' => __('Completed'),
                'description' => __('The return has been completed and the refund has been issued.'),
                'color' => '#17a2b8',
                'class' => 'info',
            ],
        ];
    }

    public static function getStatusKey($statusName)
    {
        $statuses = self::getAllReturnStatuses();
        foreach ($statuses as $key => $status) {
            if ($status['name'] === $statusName) {
                return $key;
            }
        }
        return null;
    }

    public static function getStatusTransitions()
    {
        return [
            0 => [0, 1, 2],
            1 => [1, 3],
            2 => [2],
            3 => [3],
        ];
    }

    public static function getEnabledStatuses($currentStatus)
    {
        $allStatuses = self::getAllReturnStatuses();
        $transitions = self::getStatusTransitions();

        $enabled = [];
        if (isset($transitions[$currentStatus])) {
            foreach ($transitions[$currentStatus] as $statusKey) {
                if (isset($allStatuses[$statusKey])) {
                    $enabled[] = $allStatuses[$statusKey];
                }
            }
        }
        return $enabled;
    }

    public static function generateReturnOrderNumber(): string
    {
        $year = now()->year;

        // Get last return order number for this year
        $last = ReturnOrder::whereYear('created_at', $year)
            ->orderByDesc('id')
            ->value('return_order_number');

        if ($last && preg_match('/-(\d+)$/', $last, $matches)) {
            $next = intval($matches[1]) + 1;
        } else {
            $next = 1;
        }

        // Format sequence with leading zeros (6 digits)
        $sequence = str_pad($next, 6, '0', STR_PAD_LEFT);

        return "RET-{$year}-{$sequence}";
    }

    public const STATUS_TRANSITIONS = [
        0 => [0, 1, 2], // Requested -> Requested, Approved, Rejected
        1 => [1, 3],    // Approved -> Approved, Completed
        2 => [2],       // Rejected -> Rejected
        3 => [3],       // Completed -> Completed
    ];

    public function canTransitionTo(int $newStatus): bool
    {
        $current = (int) $this->status['key'] ?? null;
        return isset(self::STATUS_TRANSITIONS[$current])
            ? in_array($newStatus, self::STATUS_TRANSITIONS[$current])
            : false;
    }
}
