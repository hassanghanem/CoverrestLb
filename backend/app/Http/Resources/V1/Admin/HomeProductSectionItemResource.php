<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class HomeProductSectionItemResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'home_section_id' => $this->home_section_id,
            'product_id' => $this->product_id,
            'arrangement' => $this->arrangement,
            'is_active' => $this->is_active,
            'product' => new ProductResource($this->whenLoaded('product')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
