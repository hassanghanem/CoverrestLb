<?php

namespace App\Services;

use App\Models\Otp;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Exceptions\RateLimitException;
use Illuminate\Support\Facades\Cache;

class OtpService
{
    public function generateOtp($email)
    {
        // Check if too many OTP requests (max 5 per hour)
        if (Cache::get('otp_attempts_' . $email) >= 5) {
            throw new RateLimitException('Too many OTP requests. Please try again later.');
        }
        $otp = rand(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(5);
        Otp::updateOrCreate(
            ['email' => $email],
            ['otp' => $otp, 'expires_at' => $expiresAt]
        );
        Cache::put('otp_attempts_' . $email, Cache::get('otp_attempts_' . $email, 0) + 1, Carbon::now()->addHour());

        return [$otp, $expiresAt];
    }

    public function verifyOtp($email, $otp)
    {
        // Check for account lockout (IP + Email based)
        $lockoutKey = 'otp_lockout_' . $email;
        $lockoutUntil = Cache::get($lockoutKey);
        
        if ($lockoutUntil && Carbon::now()->lt($lockoutUntil)) {
            $remainingTime = Carbon::now()->diffInMinutes($lockoutUntil);
            throw new RateLimitException("Account temporarily locked. Please try again in {$remainingTime} minutes.");
        }

        // Check verification attempts (max 3 per OTP generation)
        $attemptKey = 'otp_verify_attempts_' . $email;
        $attempts = Cache::get($attemptKey, 0);
        
        if ($attempts >= 3) {
            // Delete the OTP to prevent further attempts
            Otp::where('email', $email)->delete();
            
            // Implement progressive lockout: 15 min, 30 min, 1 hour, 24 hours
            $failureCountKey = 'otp_failure_count_' . $email;
            $failureCount = Cache::get($failureCountKey, 0) + 1;
            
            $lockoutDuration = match($failureCount) {
                1 => 15,      // 15 minutes
                2 => 30,      // 30 minutes  
                3 => 60,      // 1 hour
                default => 1440 // 24 hours
            };
            
            Cache::put($lockoutKey, Carbon::now()->addMinutes($lockoutDuration), Carbon::now()->addMinutes($lockoutDuration));
            Cache::put($failureCountKey, $failureCount, Carbon::now()->addDay());
            
            throw new RateLimitException("Too many verification attempts. Account locked for {$lockoutDuration} minutes.");
        }

        $otpRecord = Otp::where('email', $email)
            ->where('otp', $otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($otpRecord) {
            $otpRecord->delete();
            // Clear attempt counters on success
            Cache::forget($attemptKey);
            Cache::forget('otp_failure_count_' . $email);
            Cache::forget($lockoutKey);
            return true;
        }

        // Increment attempts on failure
        Cache::put($attemptKey, $attempts + 1, Carbon::now()->addMinutes(5));
        return false;
    }

    public function getRemainingLockoutTime($email)
    {
        $lockoutKey = 'otp_lockout_' . $email;
        $lockoutUntil = Cache::get($lockoutKey);
        
        if ($lockoutUntil && Carbon::now()->lt($lockoutUntil)) {
            return Carbon::now()->diffInMinutes($lockoutUntil);
        }
        
        return 0;
    }

    public function getRemainingAttempts($email)
    {
        $attemptKey = 'otp_verify_attempts_' . $email;
        $attempts = Cache::get($attemptKey, 0);
        return max(0, 3 - $attempts);
    }
}
