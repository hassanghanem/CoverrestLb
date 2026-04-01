<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Exceptions\BusinessLogicException;
use App\Exceptions\ValidationException as CustomValidationException;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\ImportException;
use App\Exceptions\RateLimitException;

abstract class Controller
{
    protected function errorResponse(string $message, Exception $e): JsonResponse
    {
        // Handle Laravel ValidationException specially to return validation errors
        if ($e instanceof ValidationException) {
            Log::info('Validation Exception: ' . $e->getMessage(), [
                'errors' => $e->errors(),
                'request_url' => request()->fullUrl(),
                'request_method' => request()->method(),
                'user_id' => Auth::check() ? Auth::id() : null,
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'result' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }

        // Check if this is a business logic exception (expected user error)
        if ($this->isBusinessLogicException($e)) {
            // Log as info/warning instead of error for business logic exceptions
            Log::info('Business Logic Exception: ' . $e->getMessage(), [
                'exception_type' => get_class($e),
                'request_url' => request()->fullUrl(),
                'request_method' => request()->method(),
                'user_id' => Auth::check() ? Auth::id() : null,
                'timestamp' => now()->toDateTimeString(),
            ]);

            // Return the exception message directly as it's user-friendly
            return response()->json([
                'result' => false,
                'message' => $e->getMessage(),
            ], 200);
        }

        // For actual system errors, log with full details
        Log::error('System Error: ' . $message, [
            'error_message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'request_url' => request()->fullUrl(),
            'request_method' => request()->method(),
            'user_id' => Auth::check() ? Auth::id() : null,
            'timestamp' => now()->toDateTimeString(),
        ]);

        return response()->json([
            'result' => false,
            'message' => $message,
            'error' => config('app.debug') ? $e->getMessage() : null,
        ], 200);
    }

    /**
     * Check if the exception is a business logic exception that should show user-friendly messages
     */
    private function isBusinessLogicException(Exception $e): bool
    {
        return $e instanceof BusinessLogicException ||
               $e instanceof CustomValidationException ||
               $e instanceof ValidationException ||
               $e instanceof InsufficientStockException ||
               $e instanceof ImportException ||
               $e instanceof RateLimitException;
    }

    /**
     * Handle business logic exceptions with user-friendly responses
     */
    protected function handleBusinessLogicException(Exception $e): JsonResponse
    {
        return $this->errorResponse($e->getMessage(), $e);
    }
}
