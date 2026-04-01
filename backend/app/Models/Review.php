<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Review extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'client_id',
        'product_id',
        'rating',
        'comment',
        'is_active',
        'is_view',
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'is_active' => 'boolean',
        'is_view' => 'boolean',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
          ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Review');
    }
}
