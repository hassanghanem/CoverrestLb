<?php

namespace App\Models;

use App\Services\UserSessionService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class Session extends Model
{
    protected $table = 'sessions';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'token_id',
        'notification_token',
        'ip_address',
        'user_agent',
        'screen_resolution',
        'timezone',
        'language',
        'referrer',
        'current_page',
        'latitude',
        'longitude',
        'last_activity',
        'is_active',
    ];

    protected $casts = [
        'last_activity' => 'integer',
        'is_active' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];


    public function token()
    {
        return $this->belongsTo(PersonalAccessToken::class, 'token_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if this session corresponds to the current device/session
     *
     * @param Request $request
     * @return bool
     */
    public function isCurrentSession(Request $request): bool
    {
        $deviceId = $request->header('X-Device-ID') ?? $request->input('device_id');
        return $this->id === $deviceId;
    }
}
