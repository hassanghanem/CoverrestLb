<?php

namespace App\Http\Controllers\V1\Client;

use App\Helpers\SortOptions;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Client\PaginationResource;
use App\Http\Resources\V1\Client\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Services\ClientSessionService;
use App\Services\SearchLogService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientShopController extends Controller
{
    protected $sessionService;
    protected $searchLogService;

    public function __construct(ClientSessionService $sessionService, SearchLogService $searchLogService)
    {
        $this->sessionService = $sessionService;
        $this->searchLogService = $searchLogService;
    }

    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:' . implode(',', SortOptions::keys()),
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable|integer|min:1|max:100',
                'available_only' => 'nullable|boolean',
                'categories' => 'nullable|array',
                'categories.*' => 'integer|distinct|min:1',
                'homeSections' => 'nullable|array',
                'homeSections.*' => 'integer|distinct|min:1',
                'colors' => 'nullable|array',
                'colors.*' => 'integer|distinct|min:1',
                'sizes' => 'nullable|array',
                'sizes.*' => 'integer|distinct|min:1',
                'brands' => 'nullable|array',
                'brands.*' => 'integer|distinct|min:1',
                'price_min' => 'nullable|numeric|min:0',
                'price_max' => 'nullable|numeric|min:1|gte:price_min',
                'page' => 'nullable|integer|min:1',
            ]);

            $locale = app()->getLocale();

            // --------------------------
            // SMART SEARCH WITH SCOUT
            // --------------------------
            $isSearching = !empty($validated['search']);
            $requiresRelationalFilters = !empty($validated['homeSections'])
                || !empty($validated['colors'])
                || !empty($validated['sizes']);

            if ($isSearching) {
                $searchTerm = trim($validated['search']);
                $scoutDriver = config('scout.driver');

                // For database driver, use SQL search directly (case-insensitive)
                // Also use SQL when relational filters are present since Meilisearch cannot apply them safely before pagination.
                if ($requiresRelationalFilters || $scoutDriver === 'database' || $scoutDriver === 'collection' || $scoutDriver === null) {
                    // SQL search with case-insensitive LIKE
                    $jsonName = "JSON_UNQUOTE(JSON_EXTRACT(products.name, '$.$locale'))";

                    $baseQuery = ProductService::baseProductQuery()
                        ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
                        ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                        ->select('products.*')
                        ->where(function ($query) use ($searchTerm, $jsonName) {
                            $query->where('products.barcode', 'LIKE', "%{$searchTerm}%")
                                ->orWhereRaw("LOWER($jsonName) LIKE LOWER(?)", ["%{$searchTerm}%"])
                                ->orWhereRaw("LOWER(brands.name) LIKE LOWER(?)", ["%{$searchTerm}%"])
                                ->orWhereRaw("LOWER(categories.name) LIKE LOWER(?)", ["%{$searchTerm}%"])
                                ->orWhereHas('tags', function ($tagQuery) use ($searchTerm) {
                                    $tagQuery->whereRaw('LOWER(name) LIKE LOWER(?)', ["%{$searchTerm}%"]);
                                });
                        });

                    // Apply filters
                    if (!empty($validated['categories'])) {
                        $baseQuery->whereIn('products.category_id', $validated['categories']);
                    }
                    if (!empty($validated['brands'])) {
                        $baseQuery->whereIn('products.brand_id', $validated['brands']);
                    }
                    if (isset($validated['price_min'])) {
                        $baseQuery->whereRaw('(products.price - (products.price * products.discount / 100)) >= ?', [$validated['price_min']]);
                    }
                    if (isset($validated['price_max'])) {
                        $baseQuery->whereRaw('(products.price - (products.price * products.discount / 100)) <= ?', [$validated['price_max']]);
                    }
                    if (!empty($validated['available_only'])) {
                        $baseQuery->where('products.availability_status', 'available');
                    }
                    if (!empty($validated['homeSections'])) {
                        $baseQuery->whereHas('homeProductSectionItems', fn($q) => $q->whereIn('home_section_id', $validated['homeSections'])->where('is_active', true));
                    }
                    if (!empty($validated['colors'])) {
                        $baseQuery->whereHas('variants', fn($q) => $q->whereIn('color_id', $validated['colors'])->where('is_active', true));
                    }
                    if (!empty($validated['sizes'])) {
                        $baseQuery->whereHas('variants', fn($q) => $q->whereIn('size_id', $validated['sizes'])->where('is_active', true));
                    }

                    $perPage = $validated['per_page'] ?? 12;
                    $products = $baseQuery->paginate($perPage);
                } else {
                    // Use Scout/Meilisearch search (case-insensitive by default)
                    // NOTE: Scout's Builder::where() only supports equality.
                    // For range filters, build Meilisearch filter expressions via callback.
                    $meiliFilters = ['availability_status != "discontinued"'];

                    if (!empty($validated['categories'])) {
                        $meiliFilters[] = 'category_id IN [' . implode(',', array_map('intval', $validated['categories'])) . ']';
                    }

                    if (!empty($validated['brands'])) {
                        $meiliFilters[] = 'brand_id IN [' . implode(',', array_map('intval', $validated['brands'])) . ']';
                    }

                    if (isset($validated['price_min'])) {
                        $meiliFilters[] = 'price >= ' . ((float) $validated['price_min']);
                    }

                    if (isset($validated['price_max'])) {
                        $meiliFilters[] = 'price <= ' . ((float) $validated['price_max']);
                    }

                    if (!empty($validated['available_only'])) {
                        $meiliFilters[] = 'availability_status = "available"';
                    }

                    $filterString = implode(' AND ', $meiliFilters);

                    // Sorting (optional). Requires sortableAttributes configured on the Meilisearch index.
                    $sortKey = $validated['sort'] ?? null;
                    $sortOption = $sortKey ? SortOptions::get($sortKey) : null;
                    $meiliSort = null;
                    if ($sortOption) {
                        $meiliField = match ($sortOption['column']) {
                            'products.created_at' => 'created_at',
                            'products.price' => 'price',
                            'products.name' => 'name',
                            'products.discount' => 'discount',
                            default => null,
                        };
                        if ($meiliField) {
                            $meiliSort = [sprintf('%s:%s', $meiliField, $sortOption['direction'])];
                        }
                    }

                    $scoutQuery = Product::search($searchTerm, function ($meilisearch, $query, array $options) use ($filterString) {
                        if ($filterString !== '') {
                            $options['filter'] = $filterString;
                        }

                        return $meilisearch->rawSearch($query, $options);
                    });

                    if ($meiliSort) {
                        $scoutQuery = Product::search($searchTerm, function ($meilisearch, $query, array $options) use ($filterString, $meiliSort) {
                            if ($filterString !== '') {
                                $options['filter'] = $filterString;
                            }
                            $options['sort'] = $meiliSort;

                            return $meilisearch->rawSearch($query, $options);
                        });
                    }

                    // Execute Scout search with pagination
                    $perPage = $validated['per_page'] ?? 12;
                    try {
                        $scoutResults = $scoutQuery->paginate($perPage);
                    } catch (\Throwable $e) {
                        // If Meilisearch is down/misconfigured, fall back to SQL search.
                        $scoutResults = null;
                    }

                    // Fallback to SQL if Scout returns no results
                    if (! $scoutResults || $scoutResults->total() === 0) {
                        // SQL fallback search using translated JSON fields (case-insensitive)
                        $jsonName = "JSON_UNQUOTE(JSON_EXTRACT(products.name, '$.$locale'))";

                        $baseQuery = ProductService::baseProductQuery()
                            ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
                            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                            ->select('products.*')
                            ->where(function ($query) use ($searchTerm, $jsonName) {
                                $query->where('products.barcode', 'LIKE', "%{$searchTerm}%")
                                    ->orWhereRaw("LOWER($jsonName) LIKE LOWER(?)", ["%{$searchTerm}%"])
                                    ->orWhereRaw("LOWER(brands.name) LIKE LOWER(?)", ["%{$searchTerm}%"])
                                    ->orWhereRaw("LOWER(categories.name) LIKE LOWER(?)", ["%{$searchTerm}%"])
                                    ->orWhereHas('tags', function ($tagQuery) use ($searchTerm) {
                                        $tagQuery->whereRaw('LOWER(name) LIKE LOWER(?)', ["%{$searchTerm}%"]);
                                    });
                            });

                        // Apply filters to fallback query
                        if (!empty($validated['categories'])) {
                            $baseQuery->whereIn('products.category_id', $validated['categories']);
                        }
                        if (!empty($validated['brands'])) {
                            $baseQuery->whereIn('products.brand_id', $validated['brands']);
                        }
                        if (isset($validated['price_min'])) {
                            $baseQuery->whereRaw('(products.price - (products.price * products.discount / 100)) >= ?', [$validated['price_min']]);
                        }
                        if (isset($validated['price_max'])) {
                            $baseQuery->whereRaw('(products.price - (products.price * products.discount / 100)) <= ?', [$validated['price_max']]);
                        }
                        if (!empty($validated['available_only'])) {
                            $baseQuery->where('products.availability_status', 'available');
                        }

                        $products = $baseQuery->paginate($perPage);
                    } else {
                        // Use Scout results
                        $products = $scoutResults;
                    }

                    // NOTE: Relational filters (homeSections/colors/sizes) are handled in the SQL branch above.
                }
            } else {
                // Regular query without search
                $baseQuery = ProductService::baseProductQuery();

                // --------------------------
                // FILTERS
                // --------------------------
                if (!empty($validated['categories'])) {
                    $baseQuery->whereIn('products.category_id', $validated['categories']);
                }
                if (!empty($validated['homeSections'])) {
                    $baseQuery->whereHas('homeProductSectionItems', fn($q) => $q->whereIn('home_section_id', $validated['homeSections'])->where('is_active', true));
                }
                if (!empty($validated['brands'])) {
                    $baseQuery->whereIn('products.brand_id', $validated['brands']);
                }
                if (!empty($validated['colors'])) {
                    $baseQuery->whereHas('variants', fn($q) => $q->whereIn('color_id', $validated['colors'])->where('is_active', true));
                }
                if (!empty($validated['sizes'])) {
                    $baseQuery->whereHas('variants', fn($q) => $q->whereIn('size_id', $validated['sizes'])->where('is_active', true));
                }

                if (!empty($validated['available_only'])) {
                    $baseQuery->where('products.availability_status', 'available');
                }

                // --------------------------
                // PRICE FILTER
                // --------------------------
                if (isset($validated['price_min'])) {
                    $baseQuery->whereRaw('(products.price - (products.price * products.discount / 100)) >= ?', [$validated['price_min']]);
                }
                if (isset($validated['price_max'])) {
                    $baseQuery->whereRaw('(products.price - (products.price * products.discount / 100)) <= ?', [$validated['price_max']]);
                }

                // --------------------------
                // SORTING
                // Always prioritize available products first (by availability_status),
                // then manual arrangement, then apply the selected sort option.
                // --------------------------
                $baseQuery->orderByRaw("CASE products.availability_status WHEN 'available' THEN 1 ELSE 2 END ASC")
                    ->orderBy('products.arrangement', 'asc');

                $sortKey = $validated['sort'] ?? 'newest';
                $sortOption = SortOptions::get($sortKey);
                if ($sortOption) {
                    $column = $sortOption['column'];
                    if ($column === 'products.price') {
                        $baseQuery->orderByRaw('(products.price - (products.price * products.discount / 100)) ' . $sortOption['direction']);
                    } elseif ($column === 'products.name') {
                        $baseQuery->orderByRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(products.name, '$.$locale'))) " . $sortOption['direction']);
                    } else {
                        $baseQuery->orderBy($column, $sortOption['direction']);
                    }
                }

                // --------------------------
                // PAGINATION
                // --------------------------
                $perPage = $validated['per_page'] ?? 12;
                $products = $baseQuery->paginate($perPage);
            }

            foreach ($products as $product) {
                $product->updateAvailabilityStatus();
                $product->variants = $product->variants->sortByDesc(fn($v) => $v->available_quantity)->values();
            }

            // --------------------------
            // LOG SEARCH
            // --------------------------
            $session = $this->sessionService->getSessionFromRequest($request)['session'] ?? null;
            $this->searchLogService->log($session, $validated);

            return response()->json([
                'result' => true,
                'message' => __('Products retrieved successfully.'),
                'products' => ProductResource::collection($products),
                'pagination' => new PaginationResource($products),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('An error occurred.'), $e);
        }
    }
}
