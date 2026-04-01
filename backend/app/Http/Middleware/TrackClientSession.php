<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ClientSession;
use App\Models\Client;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Stevebauman\Location\Facades\Location;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\TransientToken;

class TrackClientSession
{
    public function handle(Request $request, Closure $next)
    {
        // 1) Safely decode tracking header (never block)
        $trackingJson = $request->header('X-Tracking-Data');
        $tracking = [];

        if (is_string($trackingJson) && $trackingJson !== '') {
            $decoded = json_decode($trackingJson, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $tracking = $decoded;
            } else {
                Log::warning('Invalid X-Tracking-Data JSON (non-blocking)', [
                    'path' => $request->path(),
                    'ua'   => $request->userAgent(),
                    'raw'  => mb_substr($trackingJson, 0, 300),
                ]);
            }
        }

        // 2) Device ID: accept from multiple places, generate if missing
        $deviceId =
            $request->header('X-Device-ID')
            ?? $request->input('device_id')
            ?? ($tracking['device_id'] ?? null);

        if (!is_string($deviceId) || trim($deviceId) === '') {
            $deviceId = (string) Str::uuid();
        }

        // 3) Validate tracking fields (non-blocking)
        // Increase max for user_agent because Instagram UA is huge
        $validator = Validator::make($tracking, [
            'user_agent'        => 'nullable|string|max:2048',
            'screen_resolution' => 'nullable|string|max:30',
            'timezone'          => 'nullable|string|max:50',
            'language'          => 'nullable|string|max:10',
            'referrer'          => 'nullable|string|max:500',
            'page'              => 'nullable|string|max:500',
            'latitude'          => 'nullable|numeric|between:-90,90',
            'longitude'         => 'nullable|numeric|between:-180,180',
        ]);

        $validated = $validator->fails() ? [] : $validator->validated();

        if ($validator->fails()) {
            Log::info('Tracking validation failed (non-blocking)', [
                'path'   => $request->path(),
                'ua'     => $request->userAgent(),
                'errors' => $validator->errors()->toArray(),
            ]);
        }

        $latitude  = $validated['latitude'] ?? null;
        $longitude = $validated['longitude'] ?? null;

        // 4) Fallback to IP-based geolocation if needed
        if (!$latitude || !$longitude) {
            $ip = $request->ip();
            if ($ip && !self::isReservedIP($ip)) {
                $geo = Cache::remember(
                    "ip_location_$ip",
                    Carbon::now()->addDays(7),
                    fn () => Location::get($ip)
                );

                if ($geo) {
                    $latitude  = $latitude ?? $geo->latitude;
                    $longitude = $longitude ?? $geo->longitude;
                }
            }
        }

        // 5) Get user and token safely
        $user = $request->user('client');
        $token = $user?->currentAccessToken();

        $tokenId = null;
        if ($token instanceof TransientToken) {
            $tokenId = null;
        } elseif ($token instanceof PersonalAccessToken) {
            $tokenId = $token->id;
        } else {
            $tokenId = $token ? ($token->id ?? null) : null;
        }

        // 6) Ensure client_id exists
        $clientId = $user?->id;
        if ($clientId && !Client::where('id', $clientId)->exists()) {
            $clientId = null;
        }

        // 7) Prepare safe values (avoid DB overflow)
        $ua = $validated['user_agent'] ?? $request->userAgent();
        $ua = is_string($ua) ? mb_substr($ua, 0, 2048) : null;

        // 8) Block deactivated sessions and avoid reactivating them implicitly
        $existingSession = ClientSession::where('device_id', $deviceId)->first();
        if ($existingSession && !$existingSession->is_active) {
            return response()->json([
                'result' => false,
                'message' => __('Client session is not active.'),
            ], 403)->header('X-Device-ID', $deviceId);
        }

        // 9) Update/create active client session (non-blocking)
        if ($existingSession) {
            $existingSession->update([
                'client_id'          => $clientId,
                'token_id'           => $tokenId,
                'notification_token' => $request->header('X-Notification-Token'),
                'ip_address'         => $request->ip(),
                'user_agent'         => $ua,
                'screen_resolution'  => $validated['screen_resolution'] ?? null,
                'timezone'           => $validated['timezone'] ?? null,
                'language'           => $validated['language'] ?? 'en',
                'referrer'           => $validated['referrer'] ?? null,
                'current_page'       => $validated['page'] ?? null,
                'last_activity'      => Carbon::now()->timestamp,
                'latitude'           => $latitude,
                'longitude'          => $longitude,
            ]);
        } else {
            ClientSession::create([
                'device_id'          => $deviceId,
                'client_id'          => $clientId,
                'token_id'           => $tokenId,
                'notification_token' => $request->header('X-Notification-Token'),
                'ip_address'         => $request->ip(),
                'user_agent'         => $ua,
                'screen_resolution'  => $validated['screen_resolution'] ?? null,
                'timezone'           => $validated['timezone'] ?? null,
                'language'           => $validated['language'] ?? 'en',
                'referrer'           => $validated['referrer'] ?? null,
                'current_page'       => $validated['page'] ?? null,
                'is_active'          => true,
                'last_activity'      => Carbon::now()->timestamp,
                'latitude'           => $latitude,
                'longitude'          => $longitude,
            ]);
        }

        // Continue request
        $response = $next($request);

        // 10) Return device id to frontend so it can store it and reuse it
        $response->headers->set('X-Device-ID', $deviceId);

        return $response;
    }

    /**
     * Check if an IP is reserved/private.
     */
    private static function isReservedIP(string $ip): bool
    {
        return collect(['127.', '10.', '172.16.', '192.168.'])->contains(
            fn ($range) => str_starts_with($ip, $range)
        );
    }
}
