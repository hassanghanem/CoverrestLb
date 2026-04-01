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
        Schema::table('products', function (Blueprint $table) {
            $table->string('warranty', 191)->nullable()->after('max_order_quantity');
            $table->unsignedInteger('arrangement')->default(0)->after('warranty');
            $table->boolean('coupon_eligible')->default(true)->after('discount');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('warranty');
            $table->dropColumn('coupon_eligible');
            $table->dropColumn('arrangement');
        });
    }
};
