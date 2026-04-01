<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'gender' => $this->gender,
            'birthdate' => $this->birthdate ? $this->birthdate->toDateString() : null,
            'phone' => $this->phone,
            'phone_verified_at' => $this->phone_verified_at ? $this->phone_verified_at->toDateTimeString() : null,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at ? $this->email_verified_at->toDateTimeString() : null,
            'social_provider' => $this->social_provider,
            'social_id' => $this->social_id,
            'is_active' => $this->is_active,
            'last_login' => $this->last_login ? $this->last_login->toDateTimeString() : null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];
    }
}
