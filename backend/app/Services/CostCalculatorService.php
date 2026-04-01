<?php

namespace App\Services;

use App\Models\Configuration;
use App\Models\StockAdjustment;

class CostCalculatorService
{
    public const FIFO = 'fifo';
    public const LIFO = 'lifo';
    public const AVERAGE = 'average';

    /**
     * Get the cost per item for a variant based on configured costing method.
     *
     * @param int $variantId
     * @param int $quantity Number of items to cost
     * @param int|null $warehouseId Specific warehouse, or null for any
     * @return float Cost per item
     */
    public static function getCost(int $variantId, int $quantity = 1, ?int $warehouseId = null): float
    {
        $method = self::getConfiguredMethod();

        return match ($method) {
            self::FIFO => self::fifo($variantId, $quantity, $warehouseId),
            self::LIFO => self::lifo($variantId, $quantity, $warehouseId),
            self::AVERAGE => self::average($variantId, $quantity, $warehouseId),
            default => self::average($variantId, $quantity, $warehouseId),
        };
    }

    /**
     * Get the configured costing method from Configuration.
     */
    private static function getConfiguredMethod(): string
    {
        $method = Configuration::getValue('cost_method', self::FIFO);
        return strtolower($method) ?: self::FIFO;
    }

    /**
     * FIFO (First In, First Out) - uses oldest stock first.
     * Returns the weighted average cost of the oldest stock entries.
     */
    private static function fifo(int $variantId, int $quantity, ?int $warehouseId = null): float
    {
        $query = StockAdjustment::where('variant_id', $variantId)
            ->whereIn('type', ['manual', 'return'])
            ->where('quantity', '>', 0);

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $adjustments = $query->orderBy('created_at', 'asc')->get();

        return self::calculateWeightedCost($adjustments, $quantity);
    }

    /**
     * LIFO (Last In, First Out) - uses newest stock first.
     * Returns the weighted average cost of the most recent stock entries.
     */
    private static function lifo(int $variantId, int $quantity, ?int $warehouseId = null): float
    {
        $query = StockAdjustment::where('variant_id', $variantId)
            ->whereIn('type', ['manual', 'return'])
            ->where('quantity', '>', 0);

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $adjustments = $query->orderBy('created_at', 'desc')->get();

        return self::calculateWeightedCost($adjustments, $quantity);
    }

    /**
     * AVERAGE - uses the average cost of all available stock.
     * Returns the weighted average cost of all stock adjustments.
     */
    private static function average(int $variantId, int $quantity, ?int $warehouseId = null): float
    {
        $query = StockAdjustment::where('variant_id', $variantId)
            ->whereIn('type', ['manual', 'return'])
            ->where('quantity', '>', 0);

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        $positiveAdjustments = $query->get();

        if ($positiveAdjustments->isEmpty()) {
            return 0;
        }

        // Get all sale adjustments to calculate consumed quantities
        $salesGrouped = StockAdjustment::where('variant_id', $variantId)
            ->where('type', 'sale');
        
        if ($warehouseId) {
            $salesGrouped->where('warehouse_id', $warehouseId);
        }
        
        $salesGrouped = $salesGrouped->get()->groupBy('parent_adjustment_id');

        $totalCost = 0;
        $totalAvailableQty = 0;

        foreach ($positiveAdjustments as $adj) {
            // Calculate available quantity for this adjustment
            $alreadyDeducted = $salesGrouped->get($adj->id, collect())->sum('quantity');
            $availableQty = $adj->quantity + $alreadyDeducted; // alreadyDeducted is negative

            if ($availableQty > 0) {
                $totalCost += ($adj->cost_per_item ?? 0) * $availableQty;
                $totalAvailableQty += $availableQty;
            }
        }

        return $totalAvailableQty > 0 ? round($totalCost / $totalAvailableQty, 2) : 0;
    }

    /**
     * Calculate weighted average cost from a collection of adjustments.
     * Takes the first $quantity items and returns their weighted average cost.
     */
    private static function calculateWeightedCost($adjustments, int $quantity): float
    {
        $totalCost = 0;
        $remaining = $quantity;

        foreach ($adjustments as $adj) {
            if ($remaining <= 0) break;

            $usedQty = min($adj->quantity, $remaining);
            $totalCost += ($adj->cost_per_item ?? 0) * $usedQty;
            $remaining -= $usedQty;
        }

        return $quantity > 0 ? round($totalCost / $quantity, 2) : 0;
    }

    /**
     * Get all available costing methods.
     */
    public static function getAvailableMethods(): array
    {
        return [
            self::FIFO => __('FIFO (First In, First Out)'),
            self::LIFO => __('LIFO (Last In, First Out)'),
            self::AVERAGE => __('Average Cost'),
        ];
    }

    /**
     * Validate if a method is valid.
     */
    public static function isValidMethod(string $method): bool
    {
        return in_array(strtolower($method), [self::FIFO, self::LIFO, self::AVERAGE]);
    }
}
