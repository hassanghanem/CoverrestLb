<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class HomeBannerResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'home_section_id' => $this->home_section_id,
            'image' => $this->image,
            'image_mobile' => $this->imageMobile,
            'link' => $this->link,
            'title' => $this->getTranslations('title'),
            'subtitle' => $this->getTranslations('subtitle'),
            'arrangement' => $this->arrangement,
            'is_active' => $this->is_active,

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
