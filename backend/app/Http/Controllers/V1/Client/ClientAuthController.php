<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\ClientResource;
use App\Models\Client;
use App\Services\MagicLinkService;
use App\Services\ClientSessionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\MagicLinkEmail;
use App\Models\NewsletterEmail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use App\Exceptions\RateLimitException;
use Exception;
use Laravel\Socialite\Facades\Socialite;

class ClientAuthController extends Controller
{
    protected $magicLinkService;
    protected $sessionService;

    public function __construct(MagicLinkService $magicLinkService, ClientSessionService $sessionService)
    {
        $this->magicLinkService = $magicLinkService;
        $this->sessionService = $sessionService;
    }

    private function validateRequest(Request $request, array $rules, array $messages)
    {
        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json([
                'result' => false,
                'message' => $validator->errors()->first()
            ], 422);
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

    private function successResponse($message, $data = [], $status = 200)
    {
        return response()->json([
            'result' => true,
            'message' => $message,
            ...$data
        ], $status);
    }

    /**
     * Send link for authentication (Login or Register)
     */
    public function sendMagicLink(Request $request)
    {
        $validation = $this->validateRequest($request, [
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'agreeTerms' => 'nullable|boolean',
            'agreeMarketing' => 'nullable|boolean',
        ], [
            'email.required' => __('The email field is required.'),
            'email.email' => __('The email must be a valid email address.'),
        ]);

        if ($validation) return $validation;

        try {
            $email = $this->sanitizeInput($request->email);
            $client = Client::where('email', $email)->first();

            $action = 'login';
            $metadata = [];


            if (!$client) {
                $action = 'register';

                if (!$request->agreeTerms) {
                    return response()->json([
                        'result' => false,
                        'message' => __('You must agree to the terms and conditions.'),
                    ], 422);
                }

                $metadata = [
                    'name' => $this->sanitizeInput($request->name) ?? explode('@', $email)[0],
                    'agreeTerms' => (bool) $request->agreeTerms,
                    'agreeMarketing' => (bool) ($request->agreeMarketing ?? false),
                ];
            } elseif (!$client->is_active) {
                return response()->json([
                    'result' => false,
                    'message' => __('Your account has been deactivated. Please contact our support team to restore access to your account.'),
                ], 403);
            }


            $magicLink = $this->magicLinkService->generateMagicLink(
                $email,
                $action,
                $metadata,
                $request->ip(),
                $request->userAgent()
            );


            $frontendUrl = config('app.frontend_url');
            $magicLinkUrl = $this->magicLinkService->generateUrl($magicLink, $frontendUrl);


            $userName = $client ? $client->name : ($metadata['name'] ?? 'Guest');

            Mail::to($email)->send(
                new MagicLinkEmail($magicLinkUrl, $userName, $magicLink->expires_at, $action)
            );

            $this->sessionService->logSessionActivity($request, "Client {$action} link sent successfully", [], $client);

            return $this->successResponse(__('We have sent a secure link to your email. Click it to sign in.'), [
                'expiresAt' => $magicLink->expires_at->toISOString(),
                'isNewUser' => !$client
            ]);
        } catch (RateLimitException $e) {
            $this->sessionService->logSessionActivity($request, 'Client auth link rate limited', ['error' => $e->getMessage()]);
            return $this->errorResponse(__('Too many attempts. Please try again later.'), $e, 429);
        } catch (Exception $e) {
            $this->sessionService->logSessionActivity($request, 'Client auth link sending failed', ['error' => $e->getMessage()]);
            return $this->errorResponse(__('An error occurred while sending the link.'), $e, 500);
        }
    }

    /**
     * Verify link and login/register
     */
    public function verifyMagicLink(Request $request, string $token)
    {
        try {

            $magicLink = $this->magicLinkService->verifyMagicLink($token);

            if (!$magicLink) {
                return response()->json([
                    'result' => false,
                    'message' => __('Invalid or expired link.'),
                ], 400);
            }

            $client = Client::where('email', $magicLink->email)->first();


            if (!$client) {
                $metadata = $magicLink->metadata ?? [];

                $client = Client::create([
                    'name' => $this->sanitizeInput($metadata['name'] ?? explode('@', $magicLink->email)[0]),
                    'email' => $magicLink->email,
                    'email_verified_at' => Carbon::now(),
                    'last_login' => Carbon::now(),
                    'is_active' => true,
                ]);


                if (isset($metadata['agreeMarketing']) && $metadata['agreeMarketing']) {
                    NewsletterEmail::updateOrCreate(
                        ['email' => $magicLink->email],
                        ['is_active' => true, 'subscribed_at' => Carbon::now()]
                    );
                }

                $this->sessionService->logSessionActivity($request, 'Client registered via link', [], $client);
            } else {

                if (!$client->is_active) {
                    return response()->json([
                        'result' => false,
                        'message' => __('Your account has been deactivated. Please contact our support team to restore access to your account.'),
                    ], 403);
                }

                $client->update([
                    'last_login' => Carbon::now(),
                ]);

                $this->sessionService->logSessionActivity($request, 'Client logged in via link', [], $client);
            }

            $token = $client->createToken('clientAuthToken')->plainTextToken;

            return $this->successResponse(__('Authentication successful.'), [
                'client' => [
                    'token' => $token,
                    ...(new ClientResource($client))->toArray($request),
                ],
            ]);
        } catch (Exception $e) {
            $this->sessionService->logSessionActivity($request, 'link verification failed', ['error' => $e->getMessage()]);
            return $this->errorResponse(__('An error occurred during authentication.'), $e, 500);
        }
    }

    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        try {
            $redirectUrl = Socialite::driver('google')
                ->stateless() // Important for APIs
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'result' => true,
                'message' => __('Redirecting to Google OAuth.'),
                'url' => $redirectUrl,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'result' => false,
                'message' => __('Unable to redirect to Google. Please try again.'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $client = Client::where('email', $googleUser->getEmail())->first();

            if ($client) {
                // Check if account is inactive or deleted before updating
                if (!$client->is_active) {
                    $this->sessionService->logSessionActivity($request, 'Inactive account attempted Google OAuth login', ['email' => $client->email]);
                    $frontendUrl = config('app.frontend_url');
                    return redirect($frontendUrl . '/auth/error?message=' . urlencode(__('Your account has been deactivated. Please contact our support team to restore access to your account.')));
                }

                $client->update([
                    'social_provider' => 'google',
                    'social_id' => $googleUser->getId(),
                    'email_verified_at' => $client->email_verified_at ?? Carbon::now(),
                    'last_login' => Carbon::now(),
                ]);
            } else {
                // Create new client account via Google OAuth
                $client = Client::create([
                    'name' => $googleUser->getName() ?? explode('@', $googleUser->getEmail())[0],
                    'email' => $googleUser->getEmail(),
                    'social_provider' => 'google',
                    'social_id' => $googleUser->getId(),
                    'email_verified_at' => Carbon::now(),
                    'last_login' => Carbon::now(),
                    'is_active' => true,
                ]);
            }

            $token = $client->createToken('clientAuthToken')->plainTextToken;

            $this->sessionService->logSessionActivity($request, 'Client login via Google OAuth completed successfully', [], $client);

            $frontendUrl = config('app.frontend_url');
            return redirect($frontendUrl . '/auth/callback?token=' . $token);
        } catch (Exception $e) {
            $this->sessionService->logSessionActivity($request, 'Google OAuth callback failed', ['error' => $e->getMessage()]);
            $frontendUrl = config('app.frontend_url');
            $errorUrl = $frontendUrl . '/auth/error?message=' . urlencode(__('Authentication failed. Please try again.'));

            return redirect($errorUrl);
        }
    }
}
