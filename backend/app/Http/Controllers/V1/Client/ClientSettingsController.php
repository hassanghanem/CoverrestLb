<?php

namespace App\Http\Controllers\V1\Client;

use App\Helpers\SortOptions;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\ConfigurationResource;
use App\Http\Resources\V1\Client\BrandResource;
use App\Http\Resources\V1\Client\CategoryResource;
use App\Http\Resources\V1\Client\ColorResource;
use App\Http\Resources\V1\Client\CurrencyResource;
use App\Http\Resources\V1\Client\FilterHomeSectionResource;
use App\Http\Resources\V1\Client\PageResource;
use App\Http\Resources\V1\Client\SizeResource;
use App\Http\Resources\V1\Client\SortResource;
use App\Http\Resources\V1\Client\TagResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Configuration;
use App\Models\Currency;
use App\Models\HomeSection;
use App\Models\Page;
use App\Models\Product;
use App\Models\Size;
use App\Models\Tag;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ClientSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->whereHas('products', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount(['products as count' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('arrangement', 'asc')
            ->get();

        $brands = Brand::where('is_active', true)
            ->whereHas('products', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount(['products as count' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get();

        $homeSections = HomeSection::where('type', 'product_section')
            ->where('is_active', true)
            ->whereHas('productSectionItems', function ($query) {
                $query->where('is_active', true);
            })
            ->withCount(['productSectionItems as count' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('arrangement', 'asc')
            ->get(['id', 'title']);

        $priceRangeQuery = Product::select(
            DB::raw('MAX(price - (price * discount / 100)) as max_price')
        )->first();

        $minPrice = 0;
        $maxPrice = $priceRangeQuery->max_price;

        try {
            return response()->json([
                'result' => true,
                'message' => __('Retrieved successfully.'),
                'categories' => CategoryResource::collection($categories),
                'brands' => BrandResource::collection($brands),
                'colors' => ColorResource::collection(
                    Color::whereHas('variants', function ($query) {
                        $query->where('is_active', true)
                            ->whereHas('product', function ($productQuery) {
                                $productQuery->where('is_active', true);
                            });
                    })->get()
                ),
                'sizes' => SizeResource::collection(
                    Size::whereHas('variants', function ($query) {
                        $query->where('is_active', true)
                            ->whereHas('product', function ($productQuery) {
                                $productQuery->where('is_active', true);
                            });
                    })->get()
                ),
                'currencies' => CurrencyResource::collection(Currency::get()),
                'configurations' => ConfigurationResource::collection(Configuration::all()),
                'tags' => TagResource::collection(Tag::all()),
                'sorts' => SortResource::collection(collect(SortOptions::list())),
                'homeSections' => FilterHomeSectionResource::collection(collect($homeSections)),
                'price_range' => [
                    'min' => (float) $minPrice ,
                    'max' => (float) $maxPrice,
                ],
                'pages' => PageResource::collection(Page::get()),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
