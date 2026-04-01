<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class StockResource extends JsonResource
{
    public function toArray($request): array
    {
        $variant = $this->whenLoaded('variant');

        return [
			'id' => $this->variant_id ?? $variant?->id,
            'sku' => $variant?->sku ?? '',
            'warehouse' => new WarehouseResource($this->whenLoaded('warehouse')),
            'quantity' => $this->quantity,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
