<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class NewsletterEmail extends Model
{
    
    protected $fillable = [
        'email',
        'is_active',
        'subscribed_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'subscribed_at' => 'datetime',
    ];

    /**
     * Scope to get only active subscribers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get subscribers who subscribed after a certain date
     */
    public function scopeSubscribedAfter($query, $date)
    {
        return $query->where('subscribed_at', '>=', $date);
    }

    /**
     * Get all active subscribers for promotional emails
     */
    public static function getActiveSubscribers()
    {
        return self::active()->get();
    }
}
