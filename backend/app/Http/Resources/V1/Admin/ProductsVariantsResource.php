<?php

namespace App\Http\Resources\V1\Admin;

use App\Services\CostCalculatorService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductsVariantsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $costCalculator = app(CostCalculatorService::class);
        $cost = $costCalculator->getCost($this->id, 1);

        return [
            'id' => $this->id,
            'product_info' => $this->display_sku ?? '',
            'product' => new ProductResource($this->product),
            'color' => $this->color ? new ColorResource($this->color) : null,
            'size' => $this->size ? new SizeResource($this->size) : null,
            'sku' => $this->sku,
            'price' => $this->price,
            'cost' => $cost,
            'discount' => $this->discount,
            'is_active' => $this->is_active,
            'warehouses' => $this->getWarehouseStocks(),
            'available_quantity' => $this->available_quantity ?? 0,

        ];
    }
}
