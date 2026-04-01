<?php

namespace App\Http\Controllers\V1\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\HomeSectionResource;
use App\Models\Category;
use App\Models\HomeSection;
use Exception;
use App\Services\ProductService;
use Illuminate\Support\Facades\DB;

class ClientHomeController extends Controller
{
    public function index()
    {
        try {
            $homeSections = HomeSection::where('is_active', true)
                ->with([
                    'banners' => function ($query) {
                        $query->where('is_active', true)->orderBy('arrangement', 'asc');
                    },
                    'productSectionItems' => function ($query) {
                        $query->where('is_active', true)
                            ->whereHas('product', function ($q) {
                                $q->where('availability_status', '!=', 'discontinued');
                            })
                            ->orderBy('arrangement', 'asc');
                    },
                    // Use ProductService for eager loading product and its relations
                    'productSectionItems.product' => function ($query) {
                        // Apply the same eager loading as ProductService
                        $baseQuery = ProductService::baseProductQuery();
                        $query->with($baseQuery->getEagerLoads());
                        $query->where('availability_status', '!=', 'discontinued');
                    },
                ])
                ->orderBy("arrangement", "asc")->get();


            foreach ($homeSections as $section) {
                // Filter out items whose product's category is not active
                $filteredItems = $section->productSectionItems->filter(function ($item) {
                    return $item->product && $item->product->category && $item->product->category->is_active;
                });
                $section->setRelation('productSectionItems', $filteredItems->values());

                foreach ($section->productSectionItems as $item) {
                    if ($item->product) {
                        $item->product->updateAvailabilityStatus();
                    }
                }
                if ($section->type === 'category_section') {
                    $activeCategories = Category::where('is_active', 1)
                        ->whereHas('products', function ($query) {
                            $query->where('is_active', true);
                        })
                        ->orderBy('arrangement', 'asc')
                        ->get();

                    $section->setRelation('categories', $activeCategories);
                }
            }

            return response()->json([
                'result' => true,
                'message' => __('Home sections retrieved successfully.'),
                'home_sections' => HomeSectionResource::collection($homeSections),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
