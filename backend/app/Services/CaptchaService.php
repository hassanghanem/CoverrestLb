<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class CaptchaService
{
    protected int $maxTokenAge;

    public function __construct(int $maxTokenAge = 300) 
    {
        $this->maxTokenAge = $maxTokenAge;
    }

    public function generateToken(string $clientIp, string $sessionId): array
    {
        $rateLimitKey = 'captcha_gen:' . $clientIp;

        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            return [
                'result' => false,
                'message' => 'Too many token requests',
                'token' => null,
                'status' => 429,
            ];
        }

        RateLimiter::hit($rateLimitKey);

        $nonce = Str::random(32);
        $timestamp = time();

        $hash = hash_hmac(
            'sha256',
            $nonce . $timestamp . $clientIp,
            config('app.key')
        );

        $payload = [
            'nonce' => $nonce,
            'timestamp' => $timestamp,
            'ip' => $clientIp,
            'hash' => $hash,
            'session_id' => $sessionId,
        ];

        Cache::put('captcha_nonce:' . $nonce, true, $this->maxTokenAge);

        $token = Crypt::encryptString(json_encode($payload));

        return [
            'result' => true,
            'message' => '',
            'token' => $token,
            'expires_in' => $this->maxTokenAge,
            'status' => 200,
        ];
    }
}
