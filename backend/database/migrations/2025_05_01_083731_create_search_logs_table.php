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
        Schema::create('search_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('client_session_id')
                ->constrained('client_sessions')
                ->cascadeOnDelete();

            $table->json('category_ids')->nullable();
            $table->json('brand_ids')->nullable();
            $table->json('color_ids')->nullable();


            // Price filters
            $table->decimal('price_min', 10, 2)->nullable();
            $table->decimal('price_max', 10, 2)->nullable();

            // Search text (nullable for filter-only searches)
            $table->string('text', 255)->nullable();

            // Count of repeated searches
            $table->unsignedInteger('count')->default(1);

            $table->timestamps();

            // Indexes for faster queries
            $table->index(['client_session_id', 'created_at']);
            $table->index('text');
            $table->index(['price_min', 'price_max']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_logs');
    }
};
