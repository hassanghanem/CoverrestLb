<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Client\ProfileRequest;
use App\Http\Resources\V1\Client\ClientResource;
use App\Models\Client;
use App\Models\NewsletterEmail;
use App\Services\ClientSessionService;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClientProfileController extends Controller
{
    protected $sessionService;

    public function __construct(ClientSessionService $sessionService)
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
                    'message' => __('Your account is inactive.'),
                ]);
            }

            return response()->json([
                'result' => true,
                'message' => __('Profile fetched successfully.'),
                'client' => new ClientResource($user),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
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
            $tokenName = ($token && !($token instanceof \Laravel\Sanctum\TransientToken)) ? $token->name : 'unknown';

            // Revoke the current token
            if ($token && !($token instanceof \Laravel\Sanctum\TransientToken)) {
                $token->delete();
            }

            // Clear any related session data
            try {
                DB::table('client_sessions')->where('client_id', $user->id)->delete();
            } catch (Exception $sessionException) {
                // Session cleanup failed, but continue with logout
            }

            // Log the successful logout
            $this->sessionService->logSessionActivity(
                $request,
                'Client logout completed successfully',
                ['token_name' => $tokenName],
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
                    'Client logout failed with exception',
                    ['error' => $e->getMessage()],
                    $user
                );
            }
            
            return $this->errorResponse(__('An error occurred during logout.'), $e);
        }
    }

    public function update(ProfileRequest $request)
    {
        try {
            $client = Client::find($request->user()->id);

            if (!$client) {
                return response()->json([
                    'result' => false,
                    'message' => __('Client not found.'),
                ]);
            }

            $client->update([
                'name'          => $request->name,
                'gender'        => $request->gender,
                'birthdate'     => $request->birthdate,
                'phone'         => $request->phone,
                'order_updates' => $request->order_updates ?? $client->order_updates,
            ]);

            if ($request->has('newsletter')) {
                $newsletterEmail = NewsletterEmail::where('email', $client->email)->first();

                if ($request->newsletter) {
                    if (!$newsletterEmail) {
                        NewsletterEmail::create([
                            'email' => $client->email,
                            'is_active' => true,
                            'subscribed_at' => Carbon::now(),
                        ]);
                    } else {
                        $newsletterEmail->update(['is_active' => true]);
                    }
                } else {
                    if ($newsletterEmail) {
                        $newsletterEmail->update(['is_active' => false]);
                    }
                }
            }

            return response()->json([
                'result' => true,
                'message' => __('Profile updated successfully.'),
                'client' => (new ClientResource($client))->toArray($request),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }

    public function deleteAccount(Request $request)
    {
        try {
            $client = $request->user();

            if (!$client) {
                return response()->json([
                    'result' => false,
                    'message' => __('Client not found.'),
                ]);
            }

            DB::beginTransaction();

            // Revoke all tokens
            $client->tokens()->delete();

            // Disable newsletter subscription
            NewsletterEmail::where('email', $client->email)->update([
                'is_active' => false
            ]);

            // Deactivate client account
            $client->update([
                'is_active' => false
            ]);

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Account deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
