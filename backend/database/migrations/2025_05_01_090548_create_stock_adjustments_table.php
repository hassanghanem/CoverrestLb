<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_adjustment_id')->nullable();
            $table->foreignId('variant_id')->constrained()->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained()->restrictOnDelete();
            $table->enum('type', [
                'manual',
                // 'purchase',
                'sale',
                'return',
                // 'transfer',          // stock moved between locations
                // 'supplier_return',   // stock returned to supplier
            ])->default('manual')->index();

            $table->integer('quantity');
            $table->decimal('cost_per_item', 10, 2)->nullable();
            $table->string('reason')->nullable();
            $table->foreignId('adjusted_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->unsignedBigInteger('reference_id')->nullable()->index();
            $table->string('reference_type')->nullable()->index();
            $table->timestamps();
            $table->index('variant_id');
            $table->index('warehouse_id');
            $table->index('adjusted_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
