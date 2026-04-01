<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     */
    public function toArray($request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'email'     => $this->email,
            'subject'   => $this->subject,
            'message'   => $this->message,
            'is_view'   => (bool) $this->is_view,
            'created_at'=> $this->created_at?->toDateTimeString(),
        ];
    }
}
