<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ConfigurationResource extends JsonResource
{
    public function toArray($request): array
    {
        $value = $this->value;
        if ($this->key === 'about_us' && is_array($value) && !empty($value['image'])) {
            $fullUrl =  asset(Storage::url($value['image']));
            $value['image'] = $fullUrl;
        }
        return [
            'key' => $this->key,
            'value' => $value,
        ];
    }
}
