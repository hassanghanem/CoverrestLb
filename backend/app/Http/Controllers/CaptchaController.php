<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CaptchaService;

class CaptchaController extends Controller
{
    protected CaptchaService $captchaService;

    public function __construct(CaptchaService $captchaService)
    {
        $this->captchaService = $captchaService;
    }

    public function getToken(Request $request)
    {
        $response = $this->captchaService->generateToken($request->ip(), session()->getId());

        return response()->json(
            [
                'result' => $response['result'],
                'message' => $response['message'],
                'token' => $response['token'] ?? null,
                'expires_in' => $response['expires_in'] ?? null,
            ],
            $response['status']
        );
    }
}
