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
        Schema::create('home_product_section_items', function (Blueprint $table) {
               $table->id();
            $table->foreignId('home_section_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('arrangement');
                    $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['home_section_id', 'arrangement']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_product_section_items');
    }
};
