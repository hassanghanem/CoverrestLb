<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'client' => new ClientResource($this->whenLoaded('client')),
            'is_cart' => $this->is_cart,
            'is_preorder' => $this->is_preorder,
            'address' => new AddressResource($this->whenLoaded('address')),
            'coupon' => new CouponResource($this->whenLoaded('coupon')),
            'coupon_value' => $this->coupon_value,
            'coupon_type' => $this->coupon_type,
            'address_info' => $this->address_info,
            'notes' => $this->notes,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'delivery_amount' => $this->delivery_amount,
            'status' => $this->getRawOriginal('status'),
            'status_info' => $this->status,
            'is_view' => $this->is_view,
            'source' => $this->source,
            'created_by' => $this->created_by,
            'created_by_user' => new UserResource($this->whenLoaded('createdBy')),
            'subtotal' => $this->subtotal,
            'grand_total' => $this->grand_total,
            'order_details' => OrderDetailResource::collection($this->whenLoaded('orderDetails')),
            'confirmed_at' => $this->confirmed_at?->format('Y-m-d H:i:s'),
            'packed_at' => $this->packed_at?->format('Y-m-d H:i:s'),
            'shipped_at' => $this->shipped_at?->format('Y-m-d H:i:s'),
            'delivered_at' => $this->delivered_at?->format('Y-m-d H:i:s'),
            'cancelled_at' => $this->cancelled_at?->format('Y-m-d H:i:s'),
            'returned_at' => $this->returned_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
