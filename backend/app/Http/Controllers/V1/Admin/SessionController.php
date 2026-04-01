<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Session as UserSession;
use App\Http\Resources\V1\Admin\SessionResource as V1SessionResource;
use App\Services\UserSessionService;
use Exception;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    protected $sessionService;

    public function __construct(UserSessionService $sessionService)
    {
        $this->sessionService = $sessionService;
    }

    public function getAllSessions()
    {
        try {
            $user = Auth::user();
            $sessions = UserSession::where('user_id', $user->id)->get();

            return response()->json([
                'result' => true,
                'message' => __('Sessions retrieved successfully.'),
                'sessions' => V1SessionResource::collection($sessions),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve sessions.'), $e);
        }
    }

    public function logoutOtherDevices(Request $request)
    {
        try {
            $request->validate([
                'password' => 'required|string',
            ], [
                'password.required' => __('Password is required.'),
                'password.string' => __('Password must be a string.'),
            ]);

            $user = $request->user();

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid password.'),
                ]);
            }

            $currentToken = $user->currentAccessToken();
            if (!$currentToken) {
                return response()->json([
                    'result' => false,
                    'message' => __('No active token found.'),
                ]);
            }

            $sessionCheck = $this->sessionService->getSessionFromDevice($request);

            if (!$sessionCheck['result']) {
                return response()->json([
                    'result' => false,
                    'message' => $sessionCheck['message'], // Already localized in service
                ]);
            }

            $currentSession = $sessionCheck['session'];

            UserSession::where('user_id', $user->id)
                ->where('id', '!=', $currentSession->id)
                ->delete();

            $user->tokens()
                ->where('id', '!=', $currentToken->id)
                ->delete();

            return response()->json([
                'result' => true,
                'message' => __('Logged out from other devices successfully.'),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to update session.'), $e);
        }
    }

    public function logoutSpecificDevice(Request $request)
    {
        try {
            $request->validate([
                'sessionId' => 'required|string',
                'password' => 'required|string',
            ], [
                'sessionId.required' => __('Session ID is required.'),
                'sessionId.string' => __('Session ID must be a string.'),
                'password.required' => __('Password is required.'),
                'password.string' => __('Password must be a string.'),
            ]);

            $user = $request->user();

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid password.'),
                ]);
            }

            $session = UserSession::where('id', $request->sessionId)
                ->where('user_id', $user->id)
                ->first();

            if (!$session) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid session.'),
                ]);
            }

            if ($session->token_id) {
                $user->tokens()->where('id', $session->token_id)->delete();
            }

            $session->delete();

            return response()->json([
                'result' => true,
                'message' => __('Logged out from the specified device successfully.'),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to update session.'), $e);
        }
    }
}
