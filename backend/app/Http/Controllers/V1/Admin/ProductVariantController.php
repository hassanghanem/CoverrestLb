<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Variant;
use App\Models\VariantImage;
use Illuminate\Support\Facades\DB;
use Exception;

class ProductVariantController extends Controller
{
    public function destroy(Variant $productVariant)
    {
        try {
            DB::beginTransaction();
            if ($productVariant->stockAdjustments()->exists()) {
                return response()->json([
                    'result' => false,
                    'message' => __('Cannot delete variant because it has related stock adjustments.'),
                ]);
            }
            
            // Delete variant images
            foreach ($productVariant->images as $image) {
                VariantImage::deleteImage($image->getRawOriginal('image'));
                $image->delete();
            }
            
            $productVariant->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Product variant deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete product variant.'), $e);
        }
    }
}
