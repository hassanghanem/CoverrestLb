<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;

class HomeSectionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->getTranslations('title'),
            'banners' => HomeBannerResource::collection($this->whenLoaded('banners')),
            'product_section_items' => HomeProductSectionItemResource::collection($this->whenLoaded('productSectionItems')),
            'categories' => $this->when(
                $this->type === 'category_section' && $this->relationLoaded('categories'),
                fn() => CategoryResource::collection($this->categories)
            ),
        ];
    }
}
