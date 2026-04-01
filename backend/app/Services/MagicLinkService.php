<?php

namespace App\Services;

use App\Models\ClientMagicLink;
use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use App\Exceptions\RateLimitException;

class MagicLinkService
{
    /**
     * Rate limit: 3 requests per 10 minutes per email
     */
    private const RATE_LIMIT_MAX_ATTEMPTS = 3;
    private const RATE_LIMIT_DECAY_MINUTES = 10;
    
    /**
     * Magic link expiration time in minutes
     */
    private const EXPIRATION_MINUTES = 15;

    /**
     * Generate a magic link for login or registration
     */
    public function generateMagicLink(
        string $email, 
        string $action = 'login', 
        ?array $metadata = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): ClientMagicLink {
        // Check rate limiting
        $this->checkRateLimit($email);

        // Invalidate any existing valid magic links for this email and action
        ClientMagicLink::where('email', $email)
            ->where('action', $action)
            ->valid()
            ->update(['used_at' => Carbon::now()]);

        // Generate new token
        $token = ClientMagicLink::generateToken();

        // Create magic link
        $magicLink = ClientMagicLink::create([
            'email' => $email,
            'token' => $token,
            'action' => $action,
            'metadata' => $metadata,
            'expires_at' => Carbon::now()->addMinutes(self::EXPIRATION_MINUTES),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);

        // Increment rate limiter
        RateLimiter::hit($this->getRateLimitKey($email), self::RATE_LIMIT_DECAY_MINUTES * 60);

        return $magicLink;
    }

    /**
     * Verify and consume a magic link token
     */
    public function verifyMagicLink(string $token): ?ClientMagicLink
    {
        $magicLink = ClientMagicLink::where('token', $token)
            ->valid()
            ->first();

        if (!$magicLink) {
            return null;
        }

        // Mark as used
        $magicLink->markAsUsed();

        return $magicLink;
    }

    /**
     * Check if rate limit has been exceeded
     */
    private function checkRateLimit(string $email): void
    {
        $key = $this->getRateLimitKey($email);
        
        if (RateLimiter::tooManyAttempts($key, self::RATE_LIMIT_MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);
            
            throw new RateLimitException(
                __('Too many magic link requests. Please try again in :minutes minutes.', [
                    'minutes' => $minutes
                ])
            );
        }
    }

    /**
     * Get remaining attempts for rate limiting
     */
    public function getRemainingAttempts(string $email): int
    {
        $key = $this->getRateLimitKey($email);
        $attempts = RateLimiter::attempts($key);
        
        return max(0, self::RATE_LIMIT_MAX_ATTEMPTS - $attempts);
    }

    /**
     * Get rate limit key for an email
     */
    private function getRateLimitKey(string $email): string
    {
        return 'magic_link:' . sha1($email);
    }

    /**
     * Clean up old magic links (should be called via scheduled task)
     */
    public function cleanup(): int
    {
        return ClientMagicLink::cleanup();
    }

    /**
     * Generate the magic link URL
     */
    public function generateUrl(ClientMagicLink $magicLink, string $frontendUrl): string
    {
        return rtrim($frontendUrl, '/') . '/auth/magic-link/' . $magicLink->token;
    }
}
