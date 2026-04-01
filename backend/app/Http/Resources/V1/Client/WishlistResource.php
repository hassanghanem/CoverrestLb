<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;

class WishlistResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'added_at' => $this->created_at->toDateTimeString(),
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
