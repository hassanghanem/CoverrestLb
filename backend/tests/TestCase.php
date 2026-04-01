<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Get default API headers for testing
     */
    protected function getApiHeaders(array $additional = []): array
    {
        return array_merge([
            'App-key' => config('app.frontend_app_key'),
            'Accept' => 'application/json',
            'Accept-Language' => 'en',
        ], $additional);
    }

    /**
     * Get headers with device tracking for authenticated requests
     */
    protected function getAuthHeaders(array $additional = []): array
    {
        return $this->getApiHeaders(array_merge([
            'X-Device-ID' => 'test-device-123',
            'X-Tracking-Data' => json_encode([
                'device_id' => 'test-device-123',
                'user_agent' => 'PHPUnit Test',
                'ip_address' => '127.0.0.1'
            ])
        ], $additional));
    }
}
