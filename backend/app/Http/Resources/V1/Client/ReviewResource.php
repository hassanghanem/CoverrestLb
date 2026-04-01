<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray($request): array
    {
        $clientIdFromRequest = $request->user('sanctum')->id ?? null;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'client_name' => $this->client->name,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'is_mine' => $clientIdFromRequest === $this->client_id,
        ];
    }
}
