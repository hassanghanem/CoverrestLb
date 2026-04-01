<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class OrderDetail extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'order_id',
        'variant_id',
        'quantity',
        'price',
        'discount',
        'cost',
    ];
    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'integer',
        'cost' => 'decimal:2',
        'quantity' => 'integer',
    ];
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }

    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class, 'reference_id', 'id')
            ->where('reference_type', 'order_detail')
            ->where('type', 'sale');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('OrderDetail');
    }

    public function getTotalAttribute()
    {
        $total = $this->price * $this->quantity;
        if ($this->discount) {
            $total -= ($this->discount / 100) * $total;
        }
        return round($total, 2);
    }
}
