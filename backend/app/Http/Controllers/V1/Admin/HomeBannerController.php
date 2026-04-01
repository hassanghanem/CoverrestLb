<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomeBanner;
use Illuminate\Support\Facades\DB;
use Exception;

class HomeBannerController extends Controller
{
    public function destroy(HomeBanner $homeBanner)
    {
        try {
            DB::beginTransaction();

            $sectionId = $homeBanner->home_section_id;
            $totalBanners = HomeBanner::where('home_section_id', $sectionId)->count();

            if ($totalBanners <= 1) {
                return response()->json([
                    'result' => false,
                    'message' => __('At least one banner is required in this section.'),
                ]);
            }

            HomeBanner::rearrangeAfterDelete($homeBanner->arrangement);
            HomeBanner::deleteImage($homeBanner->getRawOriginal('image'));
            HomeBanner::deleteImage($homeBanner->getRawOriginal('image_mobile'));
            
            $homeBanner->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Banner deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            return $this->errorResponse(__('Failed to delete banner.'), $e);
        }
    }
}
