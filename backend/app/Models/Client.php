<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Laravel\Sanctum\HasApiTokens;
use App\Models\NewsletterEmail;

class Client extends Model
{
    use HasApiTokens, HasFactory, LogsActivity, Authenticatable;

    protected $fillable = [
        'id',
        'name',
        'gender',
        'birthdate',
        'phone',
        'phone_verified_at',
        'email',
        'email_verified_at',
        'order_updates',
        'social_provider',
        'social_id',
        'is_active',
        'last_login',
        'remember_token',
    ];

    protected $hidden = [
        'remember_token',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'phone_verified_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'last_login' => 'datetime',
    ];
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    public function client_sessions()
    {
        return $this->hasMany(ClientSession::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function notification_user()
    {
        return $this->hasMany(Notification::class);
    }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Client');
    }

    public function isSubscribedToNewsletter(): bool
    {
        if ($this->relationLoaded('newsletterEmail')) {
            return optional($this->newsletterEmail)->is_active ?? false;
        }

        return NewsletterEmail::where('email', $this->email)
            ->where('is_active', true)
            ->exists();
    }
}
