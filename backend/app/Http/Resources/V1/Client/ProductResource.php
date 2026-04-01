<?php

namespace App\Http\Resources\V1\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $client = $request->user()
            ?? $request->user('client')
            ?? $request->user('sanctum');

        $clientId = optional($client)->id;

        $visibleReviews = $this->getVisibleReviewsForClient($clientId);
        $averageRating = $this->getAverageRatingForClient($clientId);
        $visibleReviewsCount = $this->getReviewsCountForClient($clientId);

        return [
            'id' => $this->id,
            'name' => $this->getTranslations('name'),
            'short_description' => $this->getTranslations('short_description'),
            'description' => $this->getTranslations('description'),
            'barcode' => $this->barcode,
            'slug' => $this->slug,
            'availability_status' => $this->availability_status,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'price' => $this->price,
            'discount' => $this->discount,
            'coupon_eligible' => $this->coupon_eligible,
            'min_order_quantity' => $this->min_order_quantity,
            'max_order_quantity' => $this->max_order_quantity,
            'warranty' => $this->warranty,
            'total_stock_quantity' => $this->total_stock_quantity,
            'image' => $this->images->first()->image,
            'images' => ProductImageResource::collection($this->images),
            'variants' => VariantResource::collection($this->variants),
            'tags' => TagResource::collection($this->tags),
            'specifications' => $this->specifications->map(fn($spec) => [
                'description' => $spec->getTranslations('description'),
                'id' => $spec->id,
            ]),
            'reviews' => ReviewResource::collection($visibleReviews),
            'reviews_count' => $visibleReviewsCount,
            'average_rating' => $averageRating,
        ];
    }
}
