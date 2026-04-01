<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ConfigurationResource extends JsonResource
{
    public function toArray($request): array
    {
        $value = $this->value;
        return [
            'key' => $this->key,
            'value' => $value,
        ];
    }
}
