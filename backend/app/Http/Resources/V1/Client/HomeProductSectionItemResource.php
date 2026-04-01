<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;

class HomeProductSectionItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'home_section_id' => $this->home_section_id,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
