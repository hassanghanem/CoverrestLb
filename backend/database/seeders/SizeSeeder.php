<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Size;

class SizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sizes = [
            ['en' => '32 GB', 'ar' => '32 جيجابايت'],
            ['en' => '64 GB', 'ar' => '64 جيجابايت'],
            ['en' => '128 GB', 'ar' => '128 جيجابايت'],
            ['en' => '256 GB', 'ar' => '256 جيجابايت'],
            ['en' => '512 GB', 'ar' => '512 جيجابايت'],
            ['en' => '1 TB', 'ar' => '1 تيرابايت'],
            ['en' => '2 TB', 'ar' => '2 تيرابايت'],
        ];


        foreach ($sizes as $name) {
            Size::create([
                'name' => $name
            ]);
        }
    }
}
