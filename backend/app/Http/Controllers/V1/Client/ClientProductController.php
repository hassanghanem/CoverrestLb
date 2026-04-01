<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\ProductResource;
use App\Models\ClientSession;
use App\Models\Product;
use App\Services\ProductService;
use App\Models\ProductClick;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientProductController extends Controller
{
    public function show(Request $request, $slug)
    {
        try {
            $product = ProductService::baseProductQuery()->where("slug", $slug)->firstOrFail();
            $tracking = json_decode($request->header('X-Tracking-Data'), true) ?? [];
            $deviceId = $tracking['device_id'] ?? null;

            if ($deviceId) {
                $clientSession = ClientSession::where('device_id', $deviceId)->first();
                if ($clientSession) {
                    $now = now();

                    DB::table('product_clicks')->upsert(
                        [
                            [
                                'client_session_id' => $clientSession->id,
                                'product_id' => $product->id,
                                'count' => 1,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ],
                        ],
                        ['client_session_id', 'product_id'],
                        [
                            'count' => DB::raw('count + 1'),
                            'updated_at' => $now,
                        ]
                    );
                }
            }

            $relatedProducts = ProductService::baseProductQuery()
                ->where('id', '!=', $product->id)
                ->where(function ($query) use ($product) {
                    $query->where('category_id', $product->category_id)
                        ->orWhere('brand_id', $product->brand_id)
                        ->orWhereHas(
                            'tags',
                            fn($q) =>
                            $q->whereIn('tag_id', $product->tags->pluck('id'))
                        );
                })
                ->limit(5)
                ->get();

            $product->setRelation(
                'variants',
                $product->variants
                    ->sortBy([
                        ['available_quantity', 'desc'],
                        ['color_id', 'asc'],
                        ['size_id', 'asc'],
                    ])
                    ->values()
            );


            $product->updateAvailabilityStatus();

            return response()->json([
                'result' => true,
                'message' => __('Product found successfully.'),
                'product' => new ProductResource($product),
                'related_products' => ProductResource::collection($relatedProducts),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
