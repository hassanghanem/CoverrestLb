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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
           $table->string('order_number', 40)->unique();
            $table->unsignedBigInteger('client_id');
            $table->foreign('client_id')->references('id')->on('clients')->restrictOnDelete();
            $table->boolean('is_cart')->default(true);
            $table->boolean('is_preorder')->default(false);
            $table->unsignedBigInteger('address_id')->nullable();
            $table->foreign('address_id')->references('id')->on('addresses')->restrictOnDelete();
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->foreign('coupon_id')->references('id')->on('coupons')->restrictOnDelete();
            $table->enum('coupon_type', ['fixed', 'percentage'])->nullable();
            $table->decimal('coupon_value', 10, 2)->nullable();
            $table->json('address_info')->nullable();
            $table->string('notes', 255)->nullable();
            $table->decimal('delivery_amount', 10, 2)->nullable();
            $table->string('payment_method')->nullable();
            $table->unsignedTinyInteger('payment_status')->nullable();
            $table->unsignedTinyInteger('status')->default(0);
            $table->boolean('is_view')->default(false);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('packed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('returned_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
