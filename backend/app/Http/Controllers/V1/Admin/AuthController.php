<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Admin\UserResource as V1UserResource;
use App\Services\OtpService;
use App\Services\UserSessionService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpEmail;
use Carbon\Carbon;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    protected $otpService;
    protected $sessionService;

    public function __construct(OtpService $otpService, UserSessionService $sessionService)
    {
        $this->otpService = $otpService;
        $this->sessionService = $sessionService;
    }

    private function validateRequest(Request $request, array $rules, array $messages)
    {
        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json([
                'result' => false,
                'message' => $validator->errors()->first()
            ]);
        }
        return null;
    }

    private function sanitizeInput($input)
    {
        if (is_string($input)) {
            return strip_tags(trim($input));
        }
        return $input;
    }

    private function checkAccountLockout($email)
    {
        $lockoutKey = 'admin_lockout_' . $email;
        $lockoutUntil = cache()->get($lockoutKey);
        
        if ($lockoutUntil && Carbon::now()->lt($lockoutUntil)) {
            $remainingTime = Carbon::now()->diffInMinutes($lockoutUntil);
            return [
                'locked' => true,
                'message' => "Account temporarily locked. Please try again in {$remainingTime} minutes."
            ];
        }
        
        return ['locked' => false];
    }

    private function incrementFailureCount($email)
    {
        $failureCountKey = 'admin_failure_count_' . $email;
        $failureCount = cache()->get($failureCountKey, 0) + 1;
        
        // Progressive lockout for admins: 30 min, 1 hour, 4 hours, 24 hours
        $lockoutDuration = match($failureCount) {
            1 => 30,      // 30 minutes
            2 => 60,      // 1 hour  
            3 => 240,     // 4 hours
            default => 1440 // 24 hours
        };
        
        $lockoutKey = 'admin_lockout_' . $email;
        cache()->put($lockoutKey, Carbon::now()->addMinutes($lockoutDuration), Carbon::now()->addMinutes($lockoutDuration));
        cache()->put($failureCountKey, $failureCount, Carbon::now()->addDay());
        
        return $lockoutDuration;
    }

    private function clearFailureCount($email)
    {
        cache()->forget('admin_failure_count_' . $email);
        cache()->forget('admin_lockout_' . $email);
    }

    public function login(Request $request)
    {
        $validation = $this->validateRequest($request, [
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => __('The email field is required.'),
            'email.email' => __('The email must be a valid email address.'),
            'password.required' => __('The password field is required.'),
        ]);

        if ($validation) return $validation;

        try {
            // Check account lockout first
            $lockoutCheck = $this->checkAccountLockout($request->email);
            if ($lockoutCheck['locked']) {
                return response()->json([
                    'result' => false,
                    'message' => $lockoutCheck['message']
                ]);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                // Increment failure count for brute force protection
                $lockoutDuration = $this->incrementFailureCount($request->email);
                
                $this->sessionService->logSessionActivity(
                    $request,
                    'Admin login failed with invalid credentials',
                    ['lockout_duration' => $lockoutDuration],
                    $user,
                    $user
                );
                
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid credentials. Account will be temporarily locked after multiple failed attempts.')
                ]);
            }

            if (!$user->is_active) {
                $this->sessionService->logSessionActivity(
                    $request,
                    'Admin login failed due to inactive account',
                    [],
                    $user,
                    $user
                );
                return response()->json([
                    'result' => false,
                    'message' => __('Account is inactive.')
                ]);
            }

            // Clear failure count on successful password verification
            $this->clearFailureCount($request->email);

            [$otp, $expiresAt] = $this->otpService->generateOtp($request->email);

            Mail::to($user->email)->send(new OtpEmail($otp, $user->name, $expiresAt, 'admin'));

            $this->sessionService->logSessionActivity(
                $request,
                'Admin login OTP sent successfully',
                [],
                $user,
                $user
            );

            return response()->json([
                'result' => true,
                'message' => __('OTP sent successfully.'),
                'expiresAt' => $expiresAt->toISOString(),
            ]);
        } catch (Exception $e) {
            $this->sessionService->logSessionActivity($request, 'Admin login failed with exception', ['error' => $e->getMessage()]);
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function verifyOtp(Request $request)
    {
        $validation = $this->validateRequest($request, [
            'email' => 'required|email',
            'otp' => 'required|numeric',
        ], [
            'email.required' => __('The email field is required.'),
            'email.email' => __('The email must be a valid email address.'),
            'otp.required' => __('The OTP field is required.'),
            'otp.numeric' => __('The OTP must be a number.'),
        ]);

        if ($validation) return $validation;

        try {
            // Check account lockout
            $lockoutCheck = $this->checkAccountLockout($request->email);
            if ($lockoutCheck['locked']) {
                return response()->json([
                    'result' => false,
                    'message' => $lockoutCheck['message']
                ]);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !$user->is_active) {
                return response()->json([
                    'result' => false,
                    'message' => __('Account not found or inactive.')
                ]);
            }

            if ($this->otpService->verifyOtp($request->email, $request->otp)) {
                Auth::login($user);
                setPermissionsTeamId($user->teams()->first()?->id);

                $expiresAt = Carbon::now()->addMinutes(180);
                $token = $user->createToken('adminAuthToken', ['*'], $expiresAt)->plainTextToken;

                $this->sessionService->logSessionActivity(
                    $request,
                    'Admin login completed successfully',
                    [],
                    $user,
                    $user
                );

                $userData = [
                    'token' => $token,
                    'expiresAt' => $expiresAt->toISOString(),
                    ...(new V1UserResource($user))->toArray($request),
                ];

                return response()->json([
                    'result' => true,
                    'message' => __('Login successful.'),
                    'user' => $userData,
                ]);
            }

            // Handle OTP verification failure with attempt tracking
            $remainingAttempts = $this->otpService->getRemainingAttempts($request->email);
            $message = $remainingAttempts > 0 
                ? __('Invalid OTP. :attempts attempts remaining.', ['attempts' => $remainingAttempts])
                : __('Invalid or expired OTP.');

            $this->sessionService->logSessionActivity($request, 'Admin login verification failed', [
                'remaining_attempts' => $remainingAttempts
            ]);

            return response()->json([
                'result' => false,
                'message' => $message,
                'remainingAttempts' => $remainingAttempts,
            ]);
        } catch (Exception $e) {
            $this->sessionService->logSessionActivity($request, 'Admin login verification failed with exception', ['error' => $e->getMessage()]);
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function forgotPassword(Request $request)
    {
        $validation = $this->validateRequest($request, [
            'email' => 'required|email',
        ], [
            'email.required' => __('The email field is required.'),
            'email.email' => __('The email must be a valid email address.'),
        ]);

        if ($validation) return $validation;

        try {
            $user = User::where('email', $request->email)->first();
            
            // Always return success to prevent email enumeration
            // But only send email if user exists
            if ($user && $user->is_active) {
                $token = Password::createToken($user);
                $user->sendPasswordResetNotification($token);
                
                $this->sessionService->logSessionActivity(
                    $request,
                    'Admin password reset link sent successfully',
                    [],
                    $user,
                    $user
                );
            } else {
                // Log attempted reset for non-existent/inactive user
                $this->sessionService->logSessionActivity($request, 'Admin password reset attempted for non-existent or inactive account', [
                    'attempted_email' => $request->email
                ]);
            }

            // Always return same success message
            return response()->json([
                'result' => true,
                'message' => __('If an account exists with this email, a password reset link has been sent.')
            ]);
        } catch (Exception $e) {
            $this->sessionService->logSessionActivity($request, 'Admin password reset request failed with exception', ['error' => $e->getMessage()]);
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function resetPassword(Request $request)
    {
        $validation = $this->validateRequest($request, [
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'string', 'confirmed', PasswordRule::min(8)->mixedCase()->letters()->numbers()->symbols()],
        ], [
            'token.required' => __('The reset token is required.'),
            'email.required' => __('The email field is required.'),
            'email.email' => __('The email must be a valid email address.'),
            'password.required' => __('The password field is required.'),
            'password.confirmed' => __('The password confirmation does not match.'),
            'password.min' => __('The password must be at least 8 characters.'),
            'password.mixed_case' => __('The password must contain both uppercase and lowercase letters.'),
            'password.letters' => __('The password must contain letters.'),
            'password.numbers' => __('The password must contain numbers.'),
            'password.symbols' => __('The password must contain symbols.'),
        ]);

        if ($validation) return $validation;

        try {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                        'remember_token' => Str::random(60),
                    ])->save();

                    // Clear any existing lockouts after successful password reset
                    $this->clearFailureCount($user->email);

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'result' => true,
                    'message' => __('Password has been reset successfully.')
                ]);
            }

            return response()->json([
                'result' => false, 
                'message' => match($status) {
                    Password::INVALID_TOKEN => __('Invalid or expired reset token.'),
                    Password::INVALID_USER => __('Invalid email address.'),
                    default => __('Failed to reset password.')
                }
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function logout(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Revoke the current token
            $request->user()->currentAccessToken()->delete();
            
            $this->sessionService->logSessionActivity(
                $request,
                'Admin logout completed successfully',
                [],
                $user,
                $user
            );

            return response()->json([
                'result' => true,
                'message' => __('Logged out successfully.')
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred during logout.'), $e);
        }
    }
}