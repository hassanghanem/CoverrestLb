<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\ProductImageRequest;
use App\Http\Resources\V1\Admin\ProductImageResource;
use App\Models\ProductImage;
use Illuminate\Support\Facades\DB;
use Exception;

class ProductImageController extends Controller
{
    public function update(ProductImageRequest $request, ProductImage $productImage)
    {
        try {
            DB::beginTransaction();

            $newArrangement = $request->input('arrangement', $productImage->arrangement);
            $newIsActive = $request->has('is_active') ? $request->boolean('is_active') : $productImage->is_active;

            if ($productImage->is_active && $newIsActive === false) {
                $activeCount = ProductImage::where('product_id', $productImage->product_id)
                    ->where('id', '!=', $productImage->id)
                    ->where('is_active', true)
                    ->count();

                if ($activeCount === 0) {
                    return response()->json([
                        'result' => false,
                        'message' => __('At least one image must remain active.'),
                    ]);
                }
            }

            $productImage->arrangement = ProductImage::updateArrangement($productImage, $newArrangement);
            $productImage->is_active = $newIsActive;
            $productImage->save();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Product image updated successfully.'),
                'product_image' => new ProductImageResource($productImage),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update product image.'), $e);
        }
    }

    public function destroy(ProductImage $productImage)
    {
        try {
            DB::beginTransaction();

            $productId = $productImage->product_id;
            $totalImages = ProductImage::where('product_id', $productId)->count();

            if ($totalImages <= 1) {
                return response()->json([
                    'result' => false,
                    'message' => __('At least one image is required for the product.'),
                ]);
            }

            ProductImage::rearrangeAfterDelete($productImage->arrangement);
            ProductImage::deleteImage($productImage->getRawOriginal('image'));
            $productImage->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Product image deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete product image.'), $e);
        }
    }
}
