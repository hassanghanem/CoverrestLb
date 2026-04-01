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
        Schema::create('client_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->unique();
            $table->unsignedBigInteger('client_id')->nullable();
            $table->unsignedBigInteger('token_id')->nullable();
            $table->string('notification_token', 255)->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('last_activity');
            $table->double('latitude', 10, 6)->nullable();
            $table->double('longitude', 10, 6)->nullable();
            $table->string('screen_resolution', 32)->nullable();
            $table->string('language', 10)->nullable();
            $table->string('referrer', 2048)->nullable();
            $table->string('current_page', 2048)->nullable();
            $table->string('timezone', 64)->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            $table->foreign('token_id')->references('id')->on('personal_access_tokens')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_sessions');
    }
};
