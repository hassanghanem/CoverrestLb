<?php

namespace App\Http\Resources\V1\Admin;

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
            'client_id' => $this->client_id,
            'client' => new ClientResource($this->whenLoaded('client')),
            'status' => $this->getRawOriginal('status'),
            'status_info' => $this->status,
            'reason' => $this->reason,
            'created_by' => $this->created_by,
            'created_by_user' => new UserResource($this->whenLoaded('createdBy')),
            'refund_amount' => $this->total_refund_amount,
            'details' => ReturnOrderDetailResource::collection($this->whenLoaded('details')),
            'order' => new OrderResource($this->whenLoaded('order')),
            'rejected_at' => $this->rejected_at?->format('Y-m-d H:i:s'),
            'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
            'completed_at' => $this->completed_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

        ];
    }
}
