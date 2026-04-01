<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configurations');
    }
};

// ['key' => 'theme_color1', 'value' => '#324057'],
// ['key' => 'theme_color2', 'value' => '#EEABAD'],
// ['key' => 'theme_color3', 'value' => '#EDCFCA'],
// ['key' => 'theme_color4', 'value' => '#A1B6D8'],
// ['key' => 'delivery_charge', 'value' => '5.00'],
// ['key' => 'min_stock_alert', 'value' => '10'],
// ['key' => 'store_name', 'value' => 'jays'],
// ['key' => 'contact_email', 'value' => 'support@myawesomestore.com'],
// ['key' => 'contact_phone', 'value' => '+1-555-1234'],
// ['key' => 'store_address', 'value' => 'test'],