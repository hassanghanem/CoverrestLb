<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class StockAdjustmentResource extends JsonResource
{
    public function toArray($request): array
    {

        $variant = $this->whenLoaded('variant');
        return [
            'id' => $this->id,
            'product_info' => $variant?->display_sku ?? '',
            'sku' => $variant?->sku,
            'variant' => new VariantResource($this->whenLoaded('variant')),
            'warehouse' => new WarehouseResource($this->whenLoaded('warehouse')),
            'type'          => $this->type,
            'quantity'      => $this->quantity,
            'cost_per_item' => $this->cost_per_item !== null ? number_format($this->cost_per_item, 2) : null,
            'reason'        => $this->reason,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'adjusted_by' => new UserResource($this->whenLoaded('adjustedBy')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
