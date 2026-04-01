<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ClientMagicLink extends Model
{
    protected $fillable = [
        'email',
        'token',
        'action',
        'metadata',
        'expires_at',
        'used_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    /**
     * Generate a new magic link token
     */
    public static function generateToken(): string
    {
        return hash('sha256', Str::random(64) . microtime(true));
    }

    /**
     * Check if the magic link is valid
     */
    public function isValid(): bool
    {
        return $this->used_at === null &&
            $this->expires_at->isFuture();
    }

    /**
     * Mark the magic link as used
     */
    public function markAsUsed(): void
    {
        $this->update(['used_at' => Carbon::now()]);
    }

    /**
     * Scope to get only valid links
     */
    public function scopeValid($query)
    {
        return $query->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now());
    }

    /**
     * Scope to get expired links
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', Carbon::now());
    }

    /**
     * Clean up old and expired magic links
     */
    public static function cleanup(): int
    {
        return static::where('expires_at', '<', now())
            ->orWhereNotNull('used_at')
            ->delete();
    }
}