<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    use HasFactory;

    protected $table = 'search_logs';

    protected $fillable = [
        'client_session_id',
        'category_ids',
        'brand_ids',
        'color_ids',
        'price_min',
        'price_max',
        'text',
        'fingerprint',
        'count',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'brand_ids' => 'array',
        'color_ids' => 'array',
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
    ];

    protected $attributes = [
        'count' => 1,
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            // Ensure JSON columns default to empty arrays
            $model->category_ids = $model->category_ids ?? [];
            $model->brand_ids = $model->brand_ids ?? [];
            $model->color_ids = $model->color_ids ?? [];
        });
    }

    public function clientSession()
    {
        return $this->belongsTo(ClientSession::class, 'client_session_id');
    }
}
