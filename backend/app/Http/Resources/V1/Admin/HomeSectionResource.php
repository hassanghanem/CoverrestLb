<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class HomeSectionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->getTranslations('title'),
            'arrangement' => $this->arrangement,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'banners' => HomeBannerResource::collection($this->whenLoaded('banners')),
            'product_section_items' => HomeProductSectionItemResource::collection($this->whenLoaded('productSectionItems')),
        ];
    }
}
