<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'address' => new AddressResource($this->whenLoaded('address')),
            'coupon' => new CouponResource($this->whenLoaded('coupon')),
            'coupon_value' => $this->coupon_value,
            'discount_amount' => max(0, ($this->subtotal + ($this->delivery_amount ?? 0)) - $this->grand_total),
            'coupon_type' => $this->coupon_type,
            'address_info' => $this->address_info,
            'notes' => $this->notes,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'delivery_amount' => $this->delivery_amount,
            'status' => $this->getRawOriginal('status'),
            'status_info' => $this->status,
            'is_preorder' => $this->is_preorder,
            'source' => $this->source,
            'subtotal' => $this->subtotal,
            'grand_total' => $this->grand_total,
            'order_details' => OrderDetailResource::collection($this->whenLoaded('orderDetails')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
