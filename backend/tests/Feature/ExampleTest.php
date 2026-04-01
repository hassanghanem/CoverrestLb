<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        // Test a valid API endpoint instead of root
        $response = $this->withHeaders([
            'App-key' => config('app.frontend_app_key'),
            'X-Device-ID' => 'test-device-123',
            'X-Tracking-Data' => json_encode([
                'device_id' => 'test-device-123',
                'user_agent' => 'Test Agent'
            ])
        ])->getJson('/api/v1/admin/app-launch');

        $response->assertStatus(200);
    }
}
