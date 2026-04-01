<?php

namespace App\Http\Resources\V1\Client;


use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'order_number' => $this->order_number,
            'coupon' => new CouponResource($this->whenLoaded('coupon')),
            'coupon_value' => $this->coupon_value,
            'coupon_type' => $this->coupon_type,
            'delivery_amount' => $this->delivery_amount,
            'is_preorder' => $this->is_preorder,

            'items' => $this->orderDetails->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'product_id' => optional($detail->variant->product)->id,
                    'variant_id' => $detail->variant_id,
                    'quantity' => $detail->quantity,
                    'price' => $detail->price,
                    'discount' => $detail->discount,
                    'total' => $detail->getTotalAttribute(),
                    'variant' => new VariantResource($detail->variant),
                    'product' => new ProductResource(optional($detail->variant)->product),
                ];
            }),

            'subtotal' => $this->subtotal,
            'discount_amount' => max(0, ($this->subtotal + ($this->delivery_amount ?? 0)) - $this->grand_total),
            'grand_total' => $this->grand_total,
            'total_items' => $this->orderDetails->sum('quantity'),
        ];
    }
}
