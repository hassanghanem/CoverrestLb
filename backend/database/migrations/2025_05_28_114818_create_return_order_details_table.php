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
        Schema::create('return_order_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('return_order_id');
            $table->foreign('return_order_id')->references('id')->on('return_orders')->onDelete('cascade');
            $table->unsignedBigInteger('variant_id');
            $table->foreign('variant_id')->references('id')->on('variants');
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->decimal('refund_amount', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_order_details');
    }
};
