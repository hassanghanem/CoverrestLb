<?php

namespace App\Models;

use App\Exceptions\InsufficientStockException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class StockAdjustment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'variant_id',
        'warehouse_id',
        'type',
        'quantity',
        'cost_per_item',
        'reason',
        'adjusted_by',
        'reference_id',
        'reference_type',
        'parent_adjustment_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'cost_per_item' => 'decimal:2',
    ];

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
    public function adjustedBy()
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }
    public function reference()
    {
        return $this->morphTo();
    }
    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_adjustment_id');
    }
    public function children()
    {
        return $this->hasMany(self::class, 'parent_adjustment_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName(__('Stock Adjustment'))
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->logOnly($this->fillable);
    }

    /**
     * Create a stock adjustment record.
     */
    public static function createAdjustment(array $data): self
    {
        $adjustment = self::create([
            'variant_id'           => $data['variant_id'],
            'warehouse_id'         => $data['warehouse_id'],
            'type'                 => $data['type'],
            'quantity'             => $data['quantity'],
            'cost_per_item'        => $data['cost_per_item'] ?? null,
            'reason'               => $data['reason'] ?? null,
            'adjusted_by'          => $data['adjusted_by'] ?? null,
            'reference_id'         => $data['reference_id'] ?? null,
            'reference_type'       => $data['reference_type'] ?? null,
            'parent_adjustment_id' => $data['parent_adjustment_id'] ?? null,
        ]);

        // After any stock change, update the related product availability status
        // so that "available" / "out_of_stock" always reflects real stock.
        $variant = $adjustment->variant()
            ->with(['product.variants.stockAdjustments'])
            ->first();

        if ($variant && $variant->product) {
            $variant->product->updateAvailabilityStatus();
        }

        return $adjustment;
    }

    /**
     * Calculate current stock for a variant in a warehouse.
     */
    public static function currentStock(int $variantId, int $warehouseId): int
    {
        $query = self::where('variant_id', $variantId);

        if ($warehouseId !== 0) {
            $query->where('warehouse_id', $warehouseId);
        }

        return (int) $query->sum('quantity');
    }

    /**
     * System adjustment (returns or sales) without a stocks table.
     */
    public static function systemAdjust(array $data): self
    {
        $typeMap = ['return' => 1, 'sale' => -1];

        if (!isset($typeMap[$data['type']])) {
            throw new InvalidArgumentException(__('Invalid stock adjustment type.'));
        }

        $quantityChange = $typeMap[$data['type']] * abs($data['quantity']);

        // Check stock only if it's a sale
        if ($data['type'] === 'sale') {
            $currentStock = self::currentStock($data['variant_id'], $data['warehouse_id']);
            if ($currentStock < abs($quantityChange)) {
                throw new InsufficientStockException(__('Insufficient stock for this variant.'));
            }
        }

        return self::createAdjustment(array_merge($data, ['quantity' => $quantityChange]));
    }

    /**
     * Deduct stock for an order using stock adjustments only.
     */
    public static function deductForOrder(int $variantId, int $quantity, array $meta = [], ?int $warehouseId = null): void
    {
        $remaining = $quantity;

        // If a specific warehouse is provided, only deduct from that warehouse
        if ($warehouseId !== null) {
            $positiveAdjustments = self::where('variant_id', $variantId)
                ->where('warehouse_id', $warehouseId)
                ->whereIn('type', ['manual', 'return'])
                ->orderBy('created_at')
                ->get();
        } else {
            $positiveAdjustments = self::where('variant_id', $variantId)
                ->whereIn('type', ['manual', 'return'])
                ->orderBy('created_at')
                ->get();
        }

        $salesGrouped = self::where('variant_id', $variantId)
            ->where('type', 'sale')
            ->get()
            ->groupBy('parent_adjustment_id');

        foreach ($positiveAdjustments as $adjustment) {
            if ($remaining <= 0) break;

            $alreadyDeducted = $salesGrouped->get($adjustment->id, collect())->sum('quantity');
            $available = $adjustment->quantity + $alreadyDeducted;

            if ($available <= 0) continue;

            $deductQty = min($available, $remaining);

            self::systemAdjust([
                'variant_id'           => $variantId,
                'warehouse_id'         => $adjustment->warehouse_id,
                'type'                 => 'sale',
                'quantity'             => -$deductQty,
                'cost_per_item'        => $adjustment->cost_per_item,
                'reason'               => $meta['reason'] ?? __('Order'),
                'reference_id'         => $meta['reference_id'] ?? null,
                'reference_type'       => $meta['reference_type'] ?? null,
                'parent_adjustment_id' => $adjustment->id,
            ]);

            $remaining -= $deductQty;
        }

        if ($remaining > 0) {
            throw new InsufficientStockException(__('Insufficient stock for SKU :sku. Available quantity: :available', [
                'sku' => Variant::findOrFail($variantId)->display_sku,
                'available' => $quantity - $remaining,
            ]));
        }
    }

    /**
     * Check if enough stock exists for a variant.
     */
    public static function checkVariantQty(int $variantId, int $neededQty): void
    {
        $current = self::currentStock($variantId, 0); // warehouse_id 0 means total across all warehouses
        if ($current < $neededQty) {
            throw new InsufficientStockException(__('Insufficient stock for SKU :sku. Available quantity: :available', [
                'sku' => Variant::findOrFail($variantId)->display_sku,
                'available' => $current,
            ]));
        }
    }
}
