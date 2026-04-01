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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id'); // who receives
            $table->string('type'); // e.g., promotional, order_status, account_alert
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // extra data (e.g., order_id, discount details)
            $table->boolean('is_read')->default(false); // mark if user saw it
            $table->timestamp('sent_at')->nullable(); // when it was sent (email or in-app)
            $table->timestamps();
            $table->foreign('client_id')->references('id')->on('clients')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
