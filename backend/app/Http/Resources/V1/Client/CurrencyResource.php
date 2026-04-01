<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;

class CurrencyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->getTranslations('name'),
            'symbol' => $this->symbol,
            'exchange_rate' => $this->exchange_rate,
            'is_default' => (bool) $this->is_default,
   
        ];
    }
}
