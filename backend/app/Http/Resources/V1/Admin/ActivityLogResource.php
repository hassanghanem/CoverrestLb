<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'log_name' => __($this->log_name),
            'description' => __($this->description),
            'subject_type' => $this->subject_type,
            'subject_id' => $this->subject_id,
            'causer_type' => $this->causer_type,
            'causer_id' => $this->causer_id,
            'causer_name' => optional($this->causer)->name,
            'properties' => $this->properties,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
