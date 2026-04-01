<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Resources\Json\JsonResource;

class CouponResource extends JsonResource
{
    public function toArray($request): array
    {
        $currentDate = now();
        $isCurrentlyValid = $this->status == 1 
            && ($this->valid_from === null || $this->valid_from <= $currentDate)
            && ($this->valid_to === null || $this->valid_to >= $currentDate)
            && ($this->usage_limit === null || $this->usage_count < $this->usage_limit);

        return [
            'code' => $this->code,
            'type' => $this->type,
            'value' => $this->value,
            'min_order_amount' => $this->min_order_amount,
            'usage_limit' => $this->usage_limit,
            'usage_count' => $this->usage_count,
            'status' => $this->status['key'] ?? "0",
            'status_attributes' => $this->status,
            'coupon_type' => $this->coupon_type,
            'coupon_type_attributes' => $this->getAllCouponTypes($this->coupon_type),
            'valid_from' => $this->valid_from?->toDateString(),
            'valid_to' => $this->valid_to?->toDateString(),
            'is_currently_valid' => $isCurrentlyValid,
        ];
    }
}
