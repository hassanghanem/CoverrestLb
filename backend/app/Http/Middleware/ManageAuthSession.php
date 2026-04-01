<?php

namespace App\Http\Middleware;

use App\Models\Session as UserSession;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\TransientToken;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Stevebauman\Location\Facades\Location;

class ManageAuthSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $deviceId = $request->header('X-Device-ID') ?? $request->input('device_id');

        if (!$deviceId) {
            return response()->json([
                'result' => false,
                'message' => __('Device ID is required.'),
            ], 400);
        }

        // Decode tracking header
        $trackingJson = $request->header('X-Tracking-Data');
        $tracking = json_decode($trackingJson, true) ?? [];

        // Validate tracking fields
        $validator = Validator::make($tracking, [
            'user_agent'        => 'nullable|string|max:255',
            'screen_resolution' => 'nullable|string|max:30',
            'timezone'          => 'nullable|string|max:50',
            'language'          => 'nullable|string|max:10',
            'referrer'          => 'nullable|string|max:500',
            'page'              => 'nullable|string|max:500',
            'latitude'          => 'nullable|numeric|between:-90,90',
            'longitude'         => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'result' => false,
                'message' => __('Invalid tracking data.'),
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $latitude = $validated['latitude'] ?? null;
        $longitude = $validated['longitude'] ?? null;

        // Fallback to IP-based geolocation
        $ip = $request->ip();
        if ((!$latitude || !$longitude) && $ip && !$this->isReservedIP($ip)) {
            $geo = Cache::remember("ip_location_$ip", Carbon::now()->addDays(7), fn() => Location::get($ip));
            if ($geo) {
                $latitude = $latitude ?? $geo->latitude;
                $longitude = $longitude ?? $geo->longitude;
            }
        }

        $user = $request->user();
        $userId = null;
        $tokenId = null;

        if ($user) {
            // Delete expired tokens
            $expiredTokens = PersonalAccessToken::where('tokenable_id', $user->id)
                ->where('tokenable_type', get_class($user))
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', Carbon::now())
                ->pluck('id');

            if ($expiredTokens->isNotEmpty()) {
                PersonalAccessToken::whereIn('id', $expiredTokens)->delete();
                UserSession::whereIn('token_id', $expiredTokens)->delete();
            }

            // Safely get current token
            $token = $user?->currentAccessToken();
            
            // Handle different token types
            if ($token instanceof TransientToken) {
                // TransientToken doesn't have an id, it's for stateless authentication
                $tokenId = null;
            } elseif ($token instanceof PersonalAccessToken) {
                $tokenId = $token->id;
            } else {
                $tokenId = $token ? $token->id : null;
            }
            
            // For TransientToken, we still allow the session to continue
            // but we don't store a token_id in the session record

            $userId = $user->id;

            // Ensure user exists in database
            if ($userId && !User::where('id', $userId)->exists()) {
                $userId = null;
            }
        }

        // Update or create session
        UserSession::updateOrCreate(
            ['id' => $deviceId],
            [
                'user_id'            => $userId,
                'token_id'           => $tokenId,
                'notification_token' => $request->header('X-Notification-Token'),
                'ip_address'         => $ip,
                'user_agent'         => $validated['user_agent'] ?? $request->userAgent(),
                'screen_resolution'  => $validated['screen_resolution'] ?? null,
                'timezone'           => $validated['timezone'] ?? null,
                'language'           => $validated['language'] ?? 'en',
                'referrer'           => $validated['referrer'] ?? null,
                'current_page'       => $validated['page'] ?? null,
                'latitude'           => $latitude,
                'longitude'          => $longitude,
                'last_activity'      => Carbon::now()->timestamp,
                'is_active'          => true,
                'payload'            => $trackingJson,
            ]
        );

        return $next($request);
    }

    private function isReservedIP(string $ip): bool
    {
        return collect(['127.', '10.', '172.16.', '192.168.'])->contains(
            fn($range) => str_starts_with($ip, $range)
        );
    }
}
