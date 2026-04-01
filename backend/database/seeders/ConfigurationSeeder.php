<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Configuration;

class ConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configurations = [
            ['key' => 'theme_color1', 'value' => '#1E90FF'],
            ['key' => 'theme_color2', 'value' => '#0d0c0c'],
            ['key' => 'delivery_charge', 'value' => '5.00'],
            ['key' => 'delivery_duration', 'value' => '3'],
            ['key' => 'min_stock_alert', 'value' => '5'],
            ['key' => 'store_name', 'value' => 'CoverrestLB'],
            ['key' => 'contact_email', 'value' => config('mail.contacts')],
            ['key' => 'contact_phone', 'value' => '96181761157'],
            ['key' => 'store_address', 'value' => 'Tyre, Lebanon'],
            ['key' => 'business_days', 'value' => 'Monday - Saturday'],
            ['key' => 'business_hours', 'value' => '9:00 AM - 5:00 PM'],
            ['key' => 'facebook_link', 'value' => ''],
            ['key' => 'instagram_link', 'value' => 'https://www.instagram.com/coverrestlb/?igsh=MXZzd3JjbzFpOHlhYg%3D%3D#'],
            ['key' => 'youtube_link', 'value' => ''],
            ['key' => 'tiktok_link', 'value' => ''],
            ['key' => 'cost_method', 'value' => 'fifo'],
        ];

        foreach ($configurations as $configuration) {
            Configuration::firstOrCreate(
                ['key' => $configuration['key']],
                ['value' => $configuration['value']]
            );
        }
    }
}
