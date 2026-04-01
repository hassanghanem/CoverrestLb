<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->variant->product->id,
            'variant_id' => $this->variant_id,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'discount' => $this->discount,
            'total' => $this->getTotalAttribute(),
            'variant' => new VariantResource($this->whenLoaded('variant')),
            'product' => new ProductResource(optional($this->variant)->product),
        ];
    }
}
