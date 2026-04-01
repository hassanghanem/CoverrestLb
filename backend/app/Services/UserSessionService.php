<?php

namespace App\Services;

use App\Http\Resources\V1\Admin\SessionResource;
use App\Models\Session as UserSession;
use Illuminate\Http\Request;

class UserSessionService
{
    /**
     * Get the session by device_id instead of session cookie
     */
    public function getSessionFromDevice(Request $request): array
    {
        try {
            $deviceId = $request->header('X-Device-ID') ?? $request->input('device_id');

            if (!$deviceId) {
                return [
                    'result' => false,
                    'message' => __('Device ID is required'),
                    'session' => null,
                ];
            }

            $session = UserSession::where('id', $deviceId)
                ->where('is_active', true)
                ->first();

            if (!$session) {
                return [
                    'result' => false,
                    'message' => __('Client session required (device_id not found)'),
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

    /**
     * Log session activity
     */
    public function logSessionActivity(Request $request, string $event, array $extra = [], $causer = null, $subject = null): void
    {
        $sessionResult = $this->getSessionFromDevice($request);

        if (!$sessionResult['result'] || !$sessionResult['session']) {
            return; // optionally log failure
        }

        $session = $sessionResult['session'];
        $data = (new SessionResource($session))->toArray($request);

        $properties = array_merge([
            'email'       => $request->email ?? null,
            'ip'          => $data['ip_address'],
            'browser'     => $data['browser'],
            'platform'    => $data['platform'],
            'device'      => $data['device'],
            'is_mobile'   => $data['is_mobile'],
            'is_tablet'   => $data['is_tablet'],
            'is_desktop'  => $data['is_desktop'],
            'is_robot'    => $data['is_robot'],
            'location'    => $data['location'],
        ], $extra);

        $activity = activity()
            ->inLog('login')
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
