<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReturnOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'return_order_number' => $this->return_order_number,
            'order_id' => $this->order_id,
            'requested_at' => $this->requested_at?->format('Y-m-d H:i:s'),
            'processed_at' => $this->processed_at,
            'status' =>$this->getRawOriginal('status'),
            'status_info' => $this->status,
            'reason' => $this->reason,
            'refund_amount' => $this->refund_amount,
            'details' => ReturnOrderDetailResource::collection($this->whenLoaded('details')),
            'order' => new OrderResource($this->whenLoaded('order')),
        ];
    }
}
