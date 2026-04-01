<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ReturnOrderDetail extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'return_order_id',
        'variant_id',
        'quantity',
        'price',
        'refund_amount',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'refund_amount' => 'decimal:2',
    ];

    public function returnOrder()
    {
        return $this->belongsTo(ReturnOrder::class);
    }

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }
    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class, 'variant_id', 'variant_id')
            ->where('reference_type', 'return_order');
    }


    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
      ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('ReturnOrderDetail');
    }

    public function getTotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}
