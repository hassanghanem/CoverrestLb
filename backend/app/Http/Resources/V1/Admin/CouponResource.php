<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'client_id' => $this->client_id,
            'value' => $this->value,
            'usage_limit' => $this->usage_limit,
            'usage_count' => $this->usage_count,
            'min_order_amount' => $this->min_order_amount,
            'status' => $this->status['key']??"0",
            'status_attributes' => $this->status,
            'coupon_type' => $this->coupon_type,
            'coupon_type_attributes' =>$this->getAllCouponTypes($this->coupon_type) ,
            'client' => $this->whenLoaded('client'),
            'valid_from' => $this->valid_from?->toDateString(),
            'valid_to' => $this->valid_to?->toDateString(),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
