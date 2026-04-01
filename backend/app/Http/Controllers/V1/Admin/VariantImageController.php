<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\VariantImageRequest;
use App\Http\Resources\V1\Admin\VariantResource;
use App\Http\Resources\V1\Admin\VariantImageResource;
use App\Models\VariantImage;
use Illuminate\Support\Facades\DB;
use Exception;

class VariantImageController extends Controller
{
    public function update(VariantImageRequest $request, VariantImage $variantImage)
    {
        try {
            DB::beginTransaction();

            $newArrangement = $request->input('arrangement', $variantImage->arrangement);
            $newIsActive = $request->has('is_active') ? $request->boolean('is_active') : $variantImage->is_active;

            $variantImage->arrangement = VariantImage::updateArrangement($variantImage, $newArrangement);
            $variantImage->is_active = $newIsActive;
            $variantImage->save();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Variant image updated successfully.'),
                'variant_image' => new VariantImageResource($variantImage),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update variant image.'), $e);
        }
    }

    public function destroy(VariantImage $variantImage)
    {
        try {
            DB::beginTransaction();
            VariantImage::rearrangeAfterDelete($variantImage->arrangement);
            VariantImage::deleteImage($variantImage->getRawOriginal('image'));
            $variantImage->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Variant image deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete variant image.'), $e);
        }
    }
}
