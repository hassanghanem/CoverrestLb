<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Admin\UserResource as V1UserResource;
use App\Services\UserSessionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;
use Exception;
use Illuminate\Validation\Rules\Password as PasswordRule;

class ProfileController extends Controller
{
    protected $sessionService;

    public function __construct(UserSessionService $sessionService)
    {
        $this->sessionService = $sessionService;
    }

    public function getCurrentUser(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user->is_active) {
                return response()->json([
                    'result' => false,
                    'message' => __('Account is inactive.')
                ]);
            }

            return response()->json([
                'result' => true,
                'message' => __('OTP verified successfully.'),
                'user' => new V1UserResource($user),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function logout(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'result' => false,
                    'message' => __('User not authenticated.')
                ]);
            }

            // Get current token before deletion for logging
            $token = $request->user()->currentAccessToken();
            $tokenName = $token ? $token->name : 'unknown';

            // Revoke the current token
            if ($token) {
                $token->delete();
            }

            // Clear any related session data
            try {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            } catch (Exception $sessionException) {
                // Session cleanup failed, but continue with logout
            }

            // Log the successful logout
            $this->sessionService->logSessionActivity(
                $request,
                'Admin logout completed successfully',
                ['token_name' => $tokenName],
                $user,
                $user
            );

            return response()->json([
                'result' => true,
                'message' => __('Successfully logged out.')
            ]);
        } catch (Exception $e) {
            // Log failed logout attempt
            $user = Auth::user();
            if ($user) {
                $this->sessionService->logSessionActivity(
                    $request,
                    'Admin logout failed with exception',
                    ['error' => $e->getMessage()],
                    $user,
                    $user
                );
            }
            
            return $this->errorResponse(__('An error occurred during logout.'), $e);
        }
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', 'confirmed', PasswordRule::min(8)->mixedCase()->letters()->numbers()->symbols()],
        ], [
            'current_password.required' => __('The :attribute field is required.', ['attribute' => __('Current Password')]),
            'new_password.required' => __('The :attribute field is required.', ['attribute' => __('New Password')]),
            'new_password.min' => __('The :attribute must be at least :min characters.', ['attribute' => __('New Password'), 'min' => 8]),
            'new_password.confirmed' => __('The :attribute confirmation does not match.', ['attribute' => __('New Password')]),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'result' => false,
                'message' => $validator->errors()->first()
            ]);
        }

        try {
            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid current password.')
                ]);
            }

            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'result' => true,
                'message' => __('Password changed successfully.')
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
