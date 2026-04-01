<?php

namespace App\Http\Resources\V1\Admin;

use App\Services\CostCalculatorService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Get the first stock adjustment for this order detail to get the warehouse
        $stockAdjustment = $this->stockAdjustments->first();
        $warehouse = $stockAdjustment?->warehouse;
        return [
            'id' => $this->id,
            'product_id' => $this->variant->product->id,
            'variant_id' => $this->variant_id,
            'warehouse_id' => $warehouse?->id,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'discount' => $this->discount,
            'cost' => $this->cost,
            'total' => $this->getTotalAttribute(),
            'variant' => new VariantResource($this->whenLoaded('variant')),
            'product' => new ProductResource(optional($this->variant)->product),
            'warehouse' => $warehouse ? new WarehouseResource($warehouse) : null,
            'available_stock' => $this->variant->available_quantity,
        ];
    }
}
