<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class VerifyRecaptcha
{
    private $maxTokenAge = 300;

    public function handle(Request $request, Closure $next)
    {
        // Bypass recaptcha validation in testing environment
        if (app()->environment('testing')) {
            return $next($request);
        }

        $rateLimitKey = 'recaptcha:' . $request->ip();
        if (RateLimiter::tooManyAttempts($rateLimitKey, 10)) {
            Log::warning('Recaptcha rate limit exceeded', ['ip' => $request->ip()]);
            return response()->json([
                'success' => false,
                'message' => __('Too many attempts')
            ], 429);
        }
        RateLimiter::hit($rateLimitKey);

        if ($request->filled('_honeypot')) {
            Log::warning('Honeypot triggered', ['ip' => $request->ip()]);
            return response()->json([
                'success' => false,
                'message' => __('Bot detected')
            ], 400);
        }

        if (!$this->isValidOrigin($request)) {
            Log::warning('Invalid origin', [
                'ip' => $request->ip(),
                'origin' => $request->header('origin'),
                'referer' => $request->header('referer')
            ]);
            return response()->json([
                'success' => false,
                'message' => __('Invalid request origin')
            ], 400);
        }

        $token = $request->input('recaptcha_token');
        if (!$token || !is_string($token) || strlen($token) > 1000) {
            return response()->json([
                'success' => false,
                'message' => __('Invalid token format')
            ], 400);
        }

        try {
            $payload = $this->validateAndDecryptToken($token, $request->ip());

            if (!$payload) {
                return response()->json([
                    'success' => false,
                    'message' => __('Invalid captcha token')
                ], 400);
            }

            $request->attributes->set('validated_captcha', $payload);
        } catch (\Exception $e) {
            Log::error('Captcha validation error', [
                'ip' => $request->ip(),
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => __('Captcha validation failed')
            ], 400);
        }

        return $next($request);
    }

    private function isValidOrigin(Request $request): bool
    {
        $origin = $request->header('origin');
        $referer = $request->header('referer');

        if (app()->environment('production')) {
            $corsOrigins = config('cors.allowed_origins', []);

            foreach ($corsOrigins as $allowedOrigin) {
                if ($origin && str_starts_with($origin, $allowedOrigin)) {
                    return true;
                }
                if ($referer && str_starts_with($referer, $allowedOrigin)) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    private function validateAndDecryptToken(string $token, string $clientIp): ?array
    {
        $decrypted = Crypt::decryptString($token);
        $payload = json_decode($decrypted, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        $requiredFields = ['nonce', 'timestamp', 'ip', 'hash'];
        foreach ($requiredFields as $field) {
            if (!isset($payload[$field])) {
                return null;
            }
        }

        if ($payload['timestamp'] < time() - $this->maxTokenAge) {
            return null;
        }

        if ($payload['ip'] !== $clientIp) {
            return null;
        }

        $expectedHash = hash_hmac(
            'sha256',
            $payload['nonce'] . $payload['timestamp'] . $payload['ip'],
            config('app.key')
        );

        if (!hash_equals($payload['hash'], $expectedHash)) {
            return null;
        }

        return $payload;
    }
}
