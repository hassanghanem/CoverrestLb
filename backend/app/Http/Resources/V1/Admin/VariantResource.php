<?php

namespace App\Http\Resources\V1\Admin;

use App\Services\CostCalculatorService;
use Illuminate\Http\Resources\Json\JsonResource;

class VariantResource extends JsonResource
{
    public function toArray($request): array
    {
        $costCalculator = app(CostCalculatorService::class);
        $cost = $costCalculator->getCost($this->id, 1);

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'product_id' => $this->product_id,
            'product_info' => $this->display_sku ?? '',
            'color' => new ColorResource($this->whenLoaded('color')),
            'size' => new SizeResource($this->whenLoaded('size')),
            'color_id' => $this->color_id,
            'price' => $this->price,
            'cost' => $cost,
            'discount' => $this->discount,
            'is_active' => $this->is_active,
            'images' => VariantImageResource::collection($this->whenLoaded('images')),
            'available_quantity' => $this->available_quantity ?? 0,
            'warehouses' => $this->getWarehouseStocks(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
