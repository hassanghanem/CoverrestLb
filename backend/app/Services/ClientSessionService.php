<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\ClientSession;
use Illuminate\Support\Facades\Log;

class ClientSessionService
{
    public function getSessionFromRequest(Request $request): array
    {
        try {
            $deviceId = $request->header('X-Device-ID') ?? $request->input('device_id');

            if (!$deviceId) {
                return [
                    'result' => false,
                    'message' => __('Client session required (device ID missing)'),
                    'session' => null,
                ];
            }

            $session = ClientSession::where('device_id', $deviceId)
                ->where('is_active', true)
                ->first();

            if (!$session) {
                return [
                    'result' => false,
                    'message' => __('Client session required (session not found)'),
                    'session' => null,
                ];
            }

            return [
                'result' => true,
                'message' => null,
                'session' => $session,
            ];
        } catch (\Throwable $e) {
            return [
                'result' => false,
                'message' => __('Client session required (error)'),
                'session' => null,
            ];
        }
    }

    public function logSessionActivity(Request $request, string $event, array $extra = [], $causer = null, $subject = null): void
    {
        $sessionResult = $this->getSessionFromRequest($request);

        if (!$sessionResult['result'] || !$sessionResult['session']) {
            return;
        }

        $session = $sessionResult['session'];

        $properties = array_merge([
            'email'         => $causer?->email ?? $request->email ?? null,
            'ip'            => $session->ip_address,
            'browser'       => $session->user_agent,
            'device_id'     => $session->device_id,
            'location'      => ['lat' => $session->latitude, 'lon' => $session->longitude],
            'last_activity' => $session->last_activity,
        ], $extra);

        $activity = activity()
            ->inLog('client-login')
            ->withProperties(['session' => $properties]);

        if ($causer) {
            $activity->causedBy($causer);
        }

        if ($subject) {
            $activity->performedOn($subject);
        }

        $activity->log($event);
    }
}
