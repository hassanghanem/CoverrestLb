<?php

namespace App\Http\Resources\V1\Client;


use Illuminate\Http\Resources\Json\JsonResource;

class VariantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'product_id' => $this->product_id,
            'product_info' => $this->display_sku ?? '',
            'color' => new ColorResource($this->whenLoaded('color')),
            'size' => new SizeResource($this->whenLoaded('size')),
            'color_id' => $this->color_id,
            'price' => $this->price,
            'discount' => $this->discount,
            'is_active' => $this->is_active,
            'images' => VariantImageResource::collection($this->whenLoaded('images')),
            'available_quantity' => $this->available_quantity ?? 0,
        ];
    }
}
