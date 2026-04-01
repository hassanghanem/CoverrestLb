<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['banner', 'product_section','category_section']);
            $table->json('title')->nullable();
            $table->unsignedTinyInteger('arrangement');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('arrangement');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('home_sections');
    }
};
