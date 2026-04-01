<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray($request): array
    {

        return [
            'name' => $this->name,
            'gender' => $this->gender,
            'birthdate' => $this->birthdate ? $this->birthdate->toDateString() : null,
            'phone' => $this->phone,
            'phone_verified_at' => $this->phone_verified_at ? $this->phone_verified_at->toDateTimeString() : null,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at ? $this->email_verified_at->toDateTimeString() : null,
            'social_provider' => $this->social_provider,
            'order_updates' => (bool) $this->order_updates,
            'newsletter' => $this->resource->isSubscribedToNewsletter(),
            'social_id' => $this->social_id,
            'is_active' => $this->is_active,
            'last_login' => $this->last_login ? $this->last_login->toDateTimeString() : null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];
    }
}
