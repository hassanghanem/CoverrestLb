<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\ProductRequest;
use App\Http\Resources\V1\Admin\ProductResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecification;
use App\Models\ProductTag;
use App\Models\Variant;
use App\Models\VariantImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;
use ZipArchive;
use App\Exports\ProductTemplateExport;
use App\Exports\SelectedProductsTemplateExport;
use App\Helpers\ImageImportHelper;
use App\Imports\ProductImport;
use App\Models\StockAdjustment;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    /** @var array<string> */
    private array $imageDirs = [];

    private function resolveImagePath(string $relativePath): ?string
    {
        // $relativePath can be:
        // 1. Full URL: "http://localhost:8000/storage/products/filename.jpg"
        // 2. Storage path: "products/filename.jpg"
        // 3. URL encoded: "/storage/products/filename.jpg"

        // Handle full URLs by extracting the path component
        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            // Extract path from URL (e.g., /storage/products/filename.jpg)
            $parsedUrl = parse_url($relativePath);
            $relativePath = $parsedUrl['path'] ?? $relativePath;
            // Remove leading slash if present
            $relativePath = ltrim($relativePath, '/');
        }

        // Clean the path: remove "storage/" prefix if present
        $cleanPath = ltrim($relativePath, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8); // Remove "storage/" prefix
        }

        $candidates = [
            // Laravel's default: storage/app/public/
            storage_path('app/public/' . $cleanPath),
            // Symlink: public/storage/
            public_path('storage/' . $cleanPath),
            // Direct public path
            public_path($cleanPath),
            // Also check without prefix in case it's stored differently
            storage_path('app/' . $cleanPath),
            // Windows absolute path check
            base_path('storage/app/public/' . $cleanPath),
        ];

        foreach ($candidates as $path) {
            if (File::exists($path)) {
                return $path;
            }
        }

        return null;
    }
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'                     => 'nullable|string|max:255',
                'sort'                       => 'nullable|in:created_at,name,price,discount,barcode,availability_status,category_name,category.name,brand_name,brand.name,warranty,total_stock_quantity,arrangement,coupon_eligible',
                'order'                      => 'nullable|in:asc,desc',
                'per_page'                   => 'nullable',
                // Filters grouped in an object
                'filters'                    => 'nullable|array',
                'filters.category_id'         => 'nullable|integer|exists:categories,id',
                'filters.brand_id'            => 'nullable|integer|exists:brands,id',
                'filters.availability_status' => 'nullable|in:available,out_of_stock,coming_soon,discontinued,pre_order',
                'filters.coupon_eligible'     => 'nullable|string|in:true,false,1,0',
                'filters.min_price'           => 'nullable|numeric|min:0',
                'filters.max_price'           => 'nullable|numeric|min:0',
                'filters.tag_id'              => 'nullable|integer|exists:tags,id',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
                'filters.category_id.exists' => __('The selected category is invalid.'),
                'filters.brand_id.exists' => __('The selected brand is invalid.'),
                'filters.availability_status.in' => __('The selected availability status is invalid.'),
                'filters.tag_id.exists' => __('The selected tag is invalid.'),
            ]);

            $locales = config('app.locales');

            $query = Product::query()
                ->with([
                    'category',
                    'brand',
                    'images' => fn($q) => $q->orderBy('arrangement', 'asc'),
                    'variants' => fn($q) => $q->with('color', 'size', 'images'),
                    'tags',
                    'specifications',
                ])
                ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
                ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
                ->select('products.*');

            // Apply Search
            if (!empty($validated['search'])) {
                $search = $validated['search'];
                $query->where(function ($q) use ($search, $locales) {
                    foreach ($locales as $locale) {
                        $q->orWhere("products.name->$locale", 'like', "%$search%")
                            ->orWhere("products.short_description->$locale", 'like', "%$search%")
                            ->orWhere("products.description->$locale", 'like', "%$search%")
                            ->orWhere("categories.name->$locale", 'like', "%$search%");
                    }
                    $q->orWhere('brands.name', 'like', "%$search%")
                        ->orWhere('products.barcode', 'like', "%$search%")
                        ->orWhere('products.warranty', 'like', "%$search%")
                        ->orWhereHas('variants', function ($qv) use ($search) {
                            $qv->where('sku', 'like', "%$search%");
                        })
                        ->orWhereHas('tags', function ($qt) use ($search) {
                            $qt->where('name', 'like', "%$search%");
                        });
                });
            }

            // Apply Filters from the 'filters' object
            $filters = $validated['filters'] ?? [];

            $query->when(isset($filters['category_id']), fn($q) => $q->where('products.category_id', $filters['category_id']))
                ->when(isset($filters['brand_id']), fn($q) => $q->where('products.brand_id', $filters['brand_id']))
                ->when(isset($filters['availability_status']), fn($q) => $q->where('products.availability_status', $filters['availability_status']))
                ->when(isset($filters['coupon_eligible']), function ($q) use ($filters) {
                    $val = filter_var($filters['coupon_eligible'], FILTER_VALIDATE_BOOLEAN);
                    $q->where('products.coupon_eligible', $val);
                })
                ->when(isset($filters['min_price']), fn($q) => $q->where('products.price', '>=', $filters['min_price']))
                ->when(isset($filters['max_price']), fn($q) => $q->where('products.price', '<=', $filters['max_price']))
                ->when(isset($filters['tag_id']), function ($q) use ($filters) {
                    $q->whereHas('tags', fn($qt) => $qt->where('tags.id', $filters['tag_id']));
                });

            $sort = $validated['sort'] ?? 'created_at';
            $order = $validated['order'] ?? 'desc';
            $locale = app()->getLocale() ?? config('app.fallback_locale', 'en');

            if (in_array($sort, ['category_name', 'category.name'], true)) {
                $direction = $order === 'asc' ? 'asc' : 'desc';
                $query->orderByRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(categories.name, '$.$locale'))) " . $direction);
            } elseif (in_array($sort, ['brand_name', 'brand.name'], true)) {
                $direction = $order === 'asc' ? 'asc' : 'desc';
                $query->orderBy('brands.name', $direction);
            } elseif ($sort === 'name') {
                $direction = $order === 'asc' ? 'asc' : 'desc';
                $query->orderByRaw("LOWER(JSON_UNQUOTE(JSON_EXTRACT(products.name, '$.$locale'))) " . $direction);
            } elseif ($sort === 'total_stock_quantity') {
                $direction = $order === 'asc' ? 'asc' : 'desc';
                $query->orderByRaw('(
                    SELECT COALESCE(SUM(sa.quantity), 0)
                    FROM variants v
                    LEFT JOIN stock_adjustments sa ON sa.variant_id = v.id
                    WHERE v.product_id = products.id
                ) ' . $direction);
            } else {
                $query->orderBy('products.' . $sort, $order);
            }

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $products = $query->paginate($perPage);

            return response()->json([
                'result'     => true,
                'message'    => __('Products retrieved successfully.'),
                'products'   => ProductResource::collection($products),
                'pagination' => new PaginationResource($products),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve product data.'), $e);
        }
    }

    public function show(Product $product)
    {
        return response()->json([
            'result' => true,
            'message' => __('Product found successfully.'),
            'product' => new ProductResource($product->load([
                'category',
                'brand',
                'images' => fn($q) => $q->orderBy('arrangement', 'asc'),
                'variants' => fn($q) => $q->with(['color', 'size', 'images' => fn($q) => $q->orderBy('arrangement', 'asc')]),
                'tags',
                'specifications',
            ])),
        ]);
    }

    public function store(ProductRequest $request)
    {
        try {
            DB::beginTransaction();
            $product = new Product($request->except(['tags', 'images', 'variants', 'specifications']));
            $product->slug = null;
            $product->save();
            // Source-of-truth for tags is the Product::tags() relationship.
            if ($request->has('tags')) {
                $product->tags()->sync((array) $request->input('tags', []));
            }

            if ($request->has('images')) {
                foreach ($request->input('images') as $index => $imageData) {
                    if ($request->hasFile("images.$index.image")) {
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image' => ProductImage::storeImage($request->file("images.$index.image")),
                            'arrangement' => $imageData['arrangement'] ?? ProductImage::getNextArrangement(),
                            'is_active' => $imageData['is_active'] ?? true,
                        ]);
                    }
                }
            }

            if ($request->filled('variants')) {
                foreach ($request->variants as $variantData) {
                    $variant = new Variant([
                        'product_id' => $product->id,
                        'color_id' => $variantData['color_id'] ?? null,
                        'size_id' => $variantData['size_id'] ?? null,
                        'price' => $variantData['price'] ?? $product->price,
                        'discount' => $variantData['discount'] ?? $product->discount,
                    ]);
                    $variant->sku = Variant::generateSku($product, $variant->color_id, $variant->size_id);

                    $variant->save();

                    // Handle variant images if provided
                    if (isset($variantData['images']) && is_array($variantData['images'])) {
                        foreach ($variantData['images'] as $imageIndex => $imageData) {
                            if ($request->hasFile("variants.{$variantData['index']}.images.$imageIndex.image")) {
                                $arrangement = $imageData['arrangement'] ?? VariantImage::getNextArrangement($variant->id);
                                VariantImage::shiftArrangementsForNewImage($variant->id, $arrangement);
                                VariantImage::create([
                                    'variant_id' => $variant->id,
                                    'image' => VariantImage::storeImage($request->file("variants.{$variantData['index']}.images.$imageIndex.image")),
                                    'arrangement' => $arrangement,
                                    'is_active' => $imageData['is_active'] ?? true,
                                ]);
                            }
                        }
                    }

                    if (isset($variantData['open_quantity']) && $variantData['open_quantity'] > 0) {
                        // Validate required fields when opening stock is provided
                        if (!isset($variantData['warehouse_id']) || empty($variantData['warehouse_id'])) {
                            throw ValidationException::withMessages([
                                'variants' => [__('Warehouse is required when opening stock is provided')],
                            ]);
                        }
                        if (!isset($variantData['cost_per_item']) || $variantData['cost_per_item'] === '' || $variantData['cost_per_item'] === null) {
                            throw ValidationException::withMessages([
                                'variants' => [__('Cost per item is required')],
                            ]);
                        }

                        $stockData = [
                            'type' => 'manual',
                            'adjusted_by' => Auth::id(),
                            'quantity' => $variantData['open_quantity'],
                            'parent_adjustment_id' => null,
                            'variant_id' => $variant->id,
                            'warehouse_id' => $variantData['warehouse_id'],
                            'direction' => 'increase',
                            'cost_per_item' => $variantData['cost_per_item'],
                            'reason' => 'Opening stock adjustment during product creation',
                        ];
                        StockAdjustment::createAdjustment($stockData);
                    }
                }
            }

            if ($request->filled('specifications')) {
                foreach ($request->specifications as $spec) {
                    ProductSpecification::create([
                        'product_id' => $product->id,
                        'description' => $spec['description'],
                    ]);
                }
            }

            $product->load(['category', 'brand', 'images', 'variants.images', 'tags', 'specifications']);
            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Product created successfully.'),
                'product' => new ProductResource($product),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create product.'), $e);
        }
    }

    public function update(ProductRequest $request, $id)
    {
        try {
            DB::beginTransaction();
            $product = Product::findOrFail($id);

            $moveToTop = $request->boolean('move_to_top');
            $removeFromTop = $request->boolean('remove_from_top');

            // Capture original name so we can detect name changes and
            // regenerate variant SKUs when the product name is updated.
            $oldName = $product->name;

            $productData = $request->except(['tags', 'images', 'variants', 'specifications']);
            $productData['discount'] = $request->input('discount', 0);

            // Track old values before updating
            $oldPrice = $product->price;
            $oldDiscount = $product->discount;
            $priceChanged = isset($productData['price']) && $oldPrice != $productData['price'];
            $discountChanged = $oldDiscount != $productData['discount'];

            $product->fill($productData);
            $product->save();

            $nameChanged = $oldName !== $product->name;

            // Update only variants that match the old product values
            if ($priceChanged) {
                Variant::where('product_id', $product->id)
                    ->where('price', $oldPrice)
                    ->update(['price' => $product->price]);
            }
            if ($discountChanged) {
                Variant::where('product_id', $product->id)
                    ->where('discount', $oldDiscount)
                    ->update(['discount' => $product->discount]);
            }

            // If the product name changed, regenerate SKUs for all variants
            // of this product so that the SKU stays in sync with the
            // product name / color / size convention.
            if ($nameChanged) {
                $product->loadMissing(['variants']);

                foreach ($product->variants as $variant) {
                    $variant->sku = Variant::generateSku($product, $variant->color_id, $variant->size_id);
                    $variant->save();
                }
            }

            // Source-of-truth for tags is the Product::tags() relationship.
            // Keep current behavior: missing/empty tags clears existing tags.
            if ($request->has('tags')) {
                $product->tags()->sync((array) $request->input('tags', []));
            } else {
                $product->tags()->sync([]);
            }

            if ($request->has('images')) {
                foreach ($request->input('images') as $index => $imageData) {
                    if ($request->hasFile("images.$index.image")) {
                        $arrangement = $imageData['arrangement'] ?? ProductImage::getNextArrangement();
                        ProductImage::shiftArrangementsForNewImage($product->id, $arrangement);
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image' => ProductImage::storeImage($request->file("images.$index.image")),
                            'arrangement' => $arrangement,
                            'is_active' => $imageData['is_active'] ?? true,
                        ]);
                    }
                }
            }

            if ($request->filled('variants')) {
                foreach ($request->variants as $variantIndex => $variantData) {
                    // Check if this is an existing variant (has ID) or new variant
                    if (isset($variantData['id']) && $variantData['id']) {
                        // Update existing variant
                        $variant = Variant::findOrFail($variantData['id']);
                        $variant->color_id = $variantData['color_id'] ?? null;
                        $variant->size_id = $variantData['size_id'] ?? null;

                        // Price: ensure not null; if missing or null/empty, fallback to product request price
                        $incomingPriceProvided = array_key_exists('price', $variantData);
                        $incomingPrice = $incomingPriceProvided ? $variantData['price'] : null;
                        if ($incomingPrice === '' || $incomingPrice === null) {
                            // If price not provided or explicitly null/empty, use the product request price
                            $incomingPrice = $request->input('price');
                        }
                        // If still null (shouldn't happen if product price exists), keep existing or default to 0
                        if ($incomingPrice === '' || $incomingPrice === null) {
                            $incomingPrice = $variant->price ?? 0;
                        }
                        $variant->price = $incomingPrice;

                        // Discount: ensure not null; if missing or null/empty, fallback to product request discount
                        $incomingDiscountProvided = array_key_exists('discount', $variantData);
                        $incomingDiscount = $incomingDiscountProvided ? $variantData['discount'] : null;
                        if ($incomingDiscount === '' || $incomingDiscount === null) {
                            $incomingDiscount = $request->input('discount');
                        }
                        if ($incomingDiscount === '' || $incomingDiscount === null) {
                            $incomingDiscount = $variant->discount ?? 0;
                        }
                        $variant->discount = $incomingDiscount;

                        $variant->sku = Variant::generateSku($product, $variant->color_id, $variant->size_id);
                        $variant->save();
                    } else {
                        // Create new variant: if price/discount missing or null, fallback to product request
                        $createPrice = $variantData['price'] ?? null;
                        if ($createPrice === '' || $createPrice === null) {
                            $createPrice = $request->input('price');
                        }
                        if ($createPrice === '' || $createPrice === null) {
                            $createPrice = 0;
                        }
                        $createDiscount = $variantData['discount'] ?? null;
                        if ($createDiscount === '' || $createDiscount === null) {
                            $createDiscount = $request->input('discount');
                        }
                        if ($createDiscount === '' || $createDiscount === null) {
                            $createDiscount = 0;
                        }

                        $variant = new Variant([
                            'product_id' => $product->id,
                            'color_id' => $variantData['color_id'] ?? null,
                            'size_id' => $variantData['size_id'] ?? null,
                            'price' => $createPrice,
                            'discount' => $createDiscount,
                        ]);
                        $variant->sku = Variant::generateSku($product, $variant->color_id, $variant->size_id);
                        $variant->save();
                    }

                    // Handle variant images if provided.
                    // Supports both keys:
                    // - variants[*][images][*][image] (legacy)
                    // - variants[*][new_images][*][image] (used by current UI)
                    $imagesKey = null;
                    if (isset($variantData['new_images']) && is_array($variantData['new_images'])) {
                        $imagesKey = 'new_images';
                    } elseif (isset($variantData['images']) && is_array($variantData['images'])) {
                        $imagesKey = 'images';
                    }

                    if ($imagesKey !== null) {
                        $requestVariantIndex = $variantData['index'] ?? $variantIndex;
                        foreach (($variantData[$imagesKey] ?? []) as $imageIndex => $imageData) {
                            $fileKey = "variants.{$requestVariantIndex}.{$imagesKey}.{$imageIndex}.image";
                            if ($request->hasFile($fileKey)) {
                                $arrangement = $imageData['arrangement'] ?? VariantImage::getNextArrangement($variant->id);
                                VariantImage::shiftArrangementsForNewImage($variant->id, $arrangement);
                                VariantImage::create([
                                    'variant_id' => $variant->id,
                                    'image' => VariantImage::storeImage($request->file($fileKey)),
                                    'arrangement' => $arrangement,
                                    'is_active' => $imageData['is_active'] ?? true,
                                ]);
                            }
                        }
                    }

                    // Handle opening stock on update
                    if (isset($variantData['open_quantity']) && $variantData['open_quantity'] > 0) {
                        if (!isset($variantData['warehouse_id']) || empty($variantData['warehouse_id'])) {
                            throw ValidationException::withMessages([
                                'variants' => [__('Warehouse is required when opening stock is provided')],
                            ]);
                        }
                        if (!isset($variantData['cost_per_item']) || $variantData['cost_per_item'] === '' || $variantData['cost_per_item'] === null) {
                            throw ValidationException::withMessages([
                                'variants' => [__('Cost per item is required')],
                            ]);
                        }

                        $stockData = [
                            'type' => 'manual',
                            'adjusted_by' => Auth::id(),
                            'quantity' => $variantData['open_quantity'],
                            'parent_adjustment_id' => null,
                            'variant_id' => $variant->id,
                            'warehouse_id' => $variantData['warehouse_id'],
                            'direction' => 'increase',
                            'cost_per_item' => $variantData['cost_per_item'],
                            'reason' => 'Opening stock adjustment during product update',
                        ];
                        StockAdjustment::createAdjustment($stockData);
                    }
                }
            }

            ProductSpecification::where('product_id', $product->id)->delete();
            if ($request->filled('specifications')) {
                foreach ($request->specifications as $spec) {
                    ProductSpecification::create(['product_id' => $product->id, 'description' => $spec['description']]);
                }
            }

            if ($moveToTop) {
                Product::moveSelectedToTop([$product->id]);
            } elseif ($removeFromTop) {
                $otherIds = Product::where('id', '!=', $product->id)->pluck('id')->all();
                Product::moveSelectedToTop($otherIds);
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Product updated successfully.'),
                'product' => new ProductResource($product->load(['category', 'brand', 'images', 'variants.images', 'tags', 'specifications'])),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update product.'), $e);
        }
    }

    public function destroy(Product $product)
    {
        try {
            DB::beginTransaction();

            // Delete all product images
            foreach ($product->images as $image) {
                ProductImage::deleteImage($image->getRawOriginal('image'));
                $image->delete();
            }

            // Delete all variants and their images
            foreach ($product->variants as $variant) {
                // Delete variant images
                foreach ($variant->images as $variantImage) {
                    VariantImage::deleteImage($variantImage->getRawOriginal('image'));
                    $variantImage->delete();
                }

                // Delete the variant
                $variant->delete();
            }

            // Delete product tags (pivot)
            $product->tags()->detach();

            // Delete product specifications
            ProductSpecification::where('product_id', $product->id)->delete();

            // Delete the product
            $product->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Product deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete product.'), $e);
        }
    }

    public function bulkUpdate(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_ids' => 'required|array|min:1',
                'product_ids.*' => 'integer|exists:products,id',
                'update_data' => 'required|array',
                'update_data.category_id' => 'nullable|exists:categories,id',
                'update_data.brand_id' => 'nullable|exists:brands,id',
                'update_data.availability_status' => 'nullable|in:available,out_of_stock,coming_soon,discontinued,pre_order',
                'update_data.price' => 'nullable|numeric|min:0',
                'update_data.discount' => 'nullable|integer|min:0|max:100',
                'update_data.coupon_eligible' => 'nullable|boolean',
                'update_data.min_order_quantity' => 'nullable|integer|min:1',
                'update_data.max_order_quantity' => 'nullable|integer|min:1',
                'update_data.warranty' => 'nullable|string|max:191',
                'update_data.tags' => 'nullable|array',
                'update_data.tags.*' => 'integer|exists:tags,id',
                'update_data.move_to_top' => 'nullable|boolean',
                'update_data.remove_from_top' => 'nullable|boolean',
            ], [
                'product_ids.required' => __('Please select at least one product to update.'),
                'product_ids.array' => __('Product IDs must be provided as an array.'),
                'product_ids.min' => __('Please select at least one product to update.'),
                'product_ids.*.exists' => __('One or more selected products do not exist.'),
                'update_data.required' => __('Update data is required.'),
                'update_data.category_id.exists' => __('Selected category does not exist.'),
                'update_data.brand_id.exists' => __('Selected brand does not exist.'),
                'update_data.availability_status.in' => __('Invalid availability status.'),
                'update_data.price.numeric' => __('Price must be a number.'),
                'update_data.price.min' => __('Price must be at least 0.'),
                'update_data.discount.integer' => __('Discount must be an integer.'),
                'update_data.discount.min' => __('Discount must be at least 0.'),
                'update_data.discount.max' => __('Discount cannot exceed 100.'),
                'update_data.min_order_quantity.integer' => __('Minimum order quantity must be an integer.'),
                'update_data.min_order_quantity.min' => __('Minimum order quantity must be at least 1.'),
                'update_data.max_order_quantity.integer' => __('Maximum order quantity must be an integer.'),
                'update_data.max_order_quantity.min' => __('Maximum order quantity must be at least 1.'),
                'update_data.warranty.string' => __('Warranty must be a string.'),
                'update_data.warranty.max' => __('Warranty may not be greater than :max characters.', ['max' => 191]),
                'update_data.tags.array' => __('Tags must be provided as an array.'),
                'update_data.tags.*.exists' => __('One or more selected tags do not exist.'),
                'update_data.move_to_top.boolean' => __('Move to top must be true or false.'),
                'update_data.remove_from_top.boolean' => __('Remove from top must be true or false.'),
            ]);

            DB::beginTransaction();

            $updateData = $validated['update_data'];
            $productsToUpdate = Product::whereIn('id', $validated['product_ids'])->get();

            if ($productsToUpdate->isEmpty()) {
                return response()->json([
                    'result' => false,
                    'message' => __('No products found for the given IDs.'),
                ], 404);
            }

            $updatedCount = 0;
            $errors = [];

            foreach ($productsToUpdate as $product) {
                try {
                    // Prepare data to update (only fields that are provided)
                    $productUpdateData = [];

                    if (isset($updateData['category_id'])) {
                        $productUpdateData['category_id'] = $updateData['category_id'];
                    }

                    if (isset($updateData['brand_id'])) {
                        $productUpdateData['brand_id'] = $updateData['brand_id'];
                    }

                    if (isset($updateData['availability_status'])) {
                        $productUpdateData['availability_status'] = $updateData['availability_status'];
                    }

                    if (isset($updateData['price'])) {
                        $productUpdateData['price'] = $updateData['price'];
                    }

                    if (isset($updateData['discount'])) {
                        $productUpdateData['discount'] = $updateData['discount'];
                    }

                    if (isset($updateData['coupon_eligible'])) {
                        $productUpdateData['coupon_eligible'] = (bool) $updateData['coupon_eligible'];
                    }

                    if (isset($updateData['min_order_quantity'])) {
                        $productUpdateData['min_order_quantity'] = $updateData['min_order_quantity'];
                    }

                    if (isset($updateData['max_order_quantity'])) {
                        $productUpdateData['max_order_quantity'] = $updateData['max_order_quantity'];
                    }

                    if (isset($updateData['warranty'])) {
                        $productUpdateData['warranty'] = $updateData['warranty'];
                    }

                    // Update product fields only (do not propagate price/discount to variants in bulk update)
                    if (!empty($productUpdateData)) {
                        $product->update($productUpdateData);
                    }

                    // Update tags if provided
                    if (isset($updateData['tags'])) {
                        // Source-of-truth for tags is the Product::tags() relationship.
                        $product->tags()->sync((array) $updateData['tags']);
                    }

                    $updatedCount++;
                } catch (Exception $e) {
                    $errors[] = [
                        'product_id' => $product->id,
                        'barcode' => $product->barcode,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            if (!empty($updateData['move_to_top'])) {
                Product::moveSelectedToTop($productsToUpdate->pluck('id')->all());
            } elseif (!empty($updateData['remove_from_top'])) {
                $otherIds = Product::whereNotIn('id', $productsToUpdate->pluck('id'))->pluck('id')->all();
                Product::moveSelectedToTop($otherIds);
            }

            DB::commit();

            $message = __(':count product(s) updated successfully.', ['count' => $updatedCount]);

            if (!empty($errors)) {
                $message .= ' ' . __(':failed product(s) failed to update.', ['failed' => count($errors)]);
            }

            return response()->json([
                'result' => true,
                'message' => $message,
                'updated_count' => $updatedCount,
                'total_count' => count($validated['product_ids']),
                'errors' => $errors,
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to bulk update products.'), $e);
        }
    }

    public function generateBarcode()
    {
        $barcode = Product::generateBarcode();

        return response()->json([
            'result' => true,
            'message' => __('Barcode generated successfully.'),
            'barcode' => $barcode,
        ]);
    }

    /**
     * Display a printer-friendly page with barcodes for a product and its variants.
     *
     * React can open this URL in a new tab/window to immediately show a
     * print-ready layout (the view will call window.print() on load).
     */
    public function printBarcodes(Request $request, Product $product)
    {
        $product->load(['variants.color', 'variants.size']);

        $variantIds = $request->input('variant_ids');

        $variants = $product->variants
            ->when(is_array($variantIds) && !empty($variantIds), function ($collection) use ($variantIds) {
                return $collection->whereIn('id', $variantIds);
            })
            ->values();

        $labels = $variants->map(function (Variant $variant) use ($product) {
            // Build barcode value from product barcode + color + size to
            // keep a short, structured, per-variant code instead of SKU.
            $base = $product->barcode ?: $variant->sku;

            $parts = [$base];
            if ($variant->color_id) {
                $parts[] = 'C' . $variant->color_id;
            }
            if ($variant->size_id) {
                $parts[] = 'S' . $variant->size_id;
            }

            $barcodeValue = implode('-', $parts);

            return [
                'variant_id' => $variant->id,
                'sku' => $variant->sku,
                'barcode_value' => $barcodeValue,
                'product_name' => $product->name,
                'color' => $variant->color?->name,
                'size' => $variant->size?->name,
            ];
        });

        return response()
            ->view('admin.products.barcodes', [
                'product' => $product,
                'labels' => $labels,
            ]);
    }

    /**
     * Print barcodes for a selection of variants and/or products.
     *
     * Accepts query parameters:
     * - variant_ids[]: print exactly these variants' labels.
     * - product_ids[]: for each product, print labels for all its variants.
     * If both are provided, all resulting labels are combined.
     */
    public function printBulkBarcodes(Request $request)
    {
        $variantIds = (array) $request->input('variant_ids', []);
        $productIds = (array) $request->input('product_ids', []);

        $labels = collect();

        if (!empty($variantIds)) {
            $variants = Variant::with(['product', 'color', 'size'])
                ->whereIn('id', $variantIds)
                ->get();

            foreach ($variants as $variant) {
                if (!$variant->product) {
                    continue;
                }

                $base = $variant->product->barcode ?: $variant->sku;

                $parts = [$base];
                if ($variant->color_id) {
                    $parts[] = 'C' . $variant->color_id;
                }
                if ($variant->size_id) {
                    $parts[] = 'S' . $variant->size_id;
                }

                $barcodeValue = implode('-', $parts);

                $labels->push([
                    'variant_id' => $variant->id,
                    'sku' => $variant->sku,
                    'barcode_value' => $barcodeValue,
                    'product_name' => $variant->product->name,
                    'color' => $variant->color?->name,
                    'size' => $variant->size?->name,
                ]);
            }
        }

        if (!empty($productIds)) {
            $products = Product::with(['variants.color', 'variants.size'])
                ->whereIn('id', $productIds)
                ->get();

            foreach ($products as $product) {
                foreach ($product->variants as $variant) {
                    $base = $product->barcode ?: $variant->sku;

                    $parts = [$base];
                    if ($variant->color_id) {
                        $parts[] = 'C' . $variant->color_id;
                    }
                    if ($variant->size_id) {
                        $parts[] = 'S' . $variant->size_id;
                    }

                    $barcodeValue = implode('-', $parts);

                    $labels->push([
                        'variant_id' => $variant->id,
                        'sku' => $variant->sku,
                        'barcode_value' => $barcodeValue,
                        'product_name' => $product->name,
                        'color' => $variant->color?->name,
                        'size' => $variant->size?->name,
                    ]);
                }
            }
        }

        return response()
            ->view('admin.products.barcodes', [
                'product' => null,
                'labels' => $labels,
            ]);
    }

    /**
     * Return printable barcode data for a product and its variants.
     *
     * Logic:
     * - If the product has a numeric barcode, use it as the primary barcode value.
     * - Otherwise, fall back to each variant's SKU as the barcode value.
     * This allows the React side to render barcodes based either on product barcode
     * (same for all variants) or on per-variant SKUs when no product barcode exists.
     */
    public function getPrintableBarcodes(Request $request, Product $product)
    {
        $product->load(['variants.color', 'variants.size']);

        // Optional: allow filtering by specific variant IDs
        $variantIds = $request->input('variant_ids');

        $variants = $product->variants
            ->when(is_array($variantIds) && !empty($variantIds), function ($collection) use ($variantIds) {
                return $collection->whereIn('id', $variantIds);
            })
            ->values();

        $labels = $variants->map(function (Variant $variant) use ($product) {
            // API barcode value: product barcode + color/size ids; fallback to SKU.
            $base = $product->barcode ?: $variant->sku;

            $parts = [$base];
            if ($variant->color_id) {
                $parts[] = 'C' . $variant->color_id;
            }
            if ($variant->size_id) {
                $parts[] = 'S' . $variant->size_id;
            }

            $barcodeValue = implode('-', $parts);

            return [
                'variant_id' => $variant->id,
                'sku' => $variant->sku,
                'barcode_value' => $barcodeValue,
                'product_name' => $product->name,
                'color' => $variant->color?->name,
                'size' => $variant->size?->name,
            ];
        });

        return response()->json([
            'result' => true,
            'message' => __('Printable barcodes prepared successfully.'),
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'barcode' => $product->barcode,
            ],
            'labels' => $labels,
        ]);
    }

    public function exportSelected(Request $request)
    {
        set_time_limit(300); // 5 minutes for export processing
        try {
            $validated = $request->validate([
                'product_ids' => 'required|array|min:1',
                'product_ids.*' => 'integer|exists:products,id',
            ], [
                'product_ids.required' => __('Please select at least one product to export.'),
                'product_ids.array' => __('Product IDs must be provided as an array.'),
                'product_ids.min' => __('Please select at least one product to export.'),
                'product_ids.*.exists' => __('One or more selected products do not exist.'),
            ]);

            $products = Product::with([
                'category',
                'brand',
                'tags',
                'images' => fn($q) => $q->orderBy('arrangement', 'asc'),
                'variants' => fn($q) => $q->with(['color', 'size', 'images' => fn($iq) => $iq->orderBy('arrangement', 'asc')]),
                'specifications',
            ])->whereIn('id', $validated['product_ids'])->get();

            if ($products->isEmpty()) {
                return response()->json([
                    'result' => false,
                    'message' => __('No products found for the given IDs.'),
                ], 404);
            }

            $tempFolder = 'product_export_' . uniqid();
            $basePath = storage_path('app/temp/' . $tempFolder);

            File::makeDirectory($basePath, 0755, true, true);

            // 1) Build Excel in import-compatible format
            $excelRelativePath = $tempFolder . '/products.xlsx';
            $excelPath = storage_path('app/temp/' . $excelRelativePath);

            // Ensure the target directory exists
            File::makeDirectory(dirname($excelPath), 0755, true, true);

            try {
                $stored = Excel::store(new SelectedProductsTemplateExport($products), $excelRelativePath, 'temp');
            } catch (Exception $e) {
                $stored = false;
            }

            if (!$stored || !File::exists($excelPath)) {
                // Fallback: generate raw XLSX and write manually
                try {
                    $binary = Excel::raw(new SelectedProductsTemplateExport($products), ExcelFormat::XLSX);
                    File::put($excelPath, $binary);
                } catch (Exception $e) {
                    throw new Exception(__('Failed to create Excel export file: :msg', ['msg' => $e->getMessage()]));
                }
            }

            // 2) Copy product images into barcode-named folders (import-ready)
            $imagesRoot = $basePath . '/images';
            File::makeDirectory($imagesRoot, 0755, true, true);
            $this->exportProductImages($products, $imagesRoot);

            // 3) Zip Excel + images into a single archive
            $zipPath = $basePath . '/products_export.zip';
            $zip = new ZipArchive();

            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new Exception(__('Unable to create ZIP archive.'));
            }

            // Add Excel file
            $excelRealPath = realpath($excelPath);
            if (!$excelRealPath || !File::exists($excelRealPath)) {
                throw new Exception(__('Export file missing during zipping.'));
            }
            $zip->addFile($excelRealPath, 'products.xlsx');

            // Ensure images root exists in ZIP even if empty
            $zip->addEmptyDir('images');

            // Add empty directories first (products and variants) so folder tree is visible even if no files)
            foreach (array_unique($this->imageDirs) as $dirPath) {
                $relativeDir = 'images/' . ltrim(str_replace($imagesRoot, '', $dirPath), DIRECTORY_SEPARATOR);
                $zip->addEmptyDir(str_replace('\\', '/', $relativeDir));
            }

            // Add images preserving folder structure
            foreach (File::allFiles($imagesRoot) as $file) {
                $relativePath = 'images/' . ltrim(str_replace($imagesRoot, '', $file->getPathname()), DIRECTORY_SEPARATOR);
                $zip->addFile($file->getRealPath(), str_replace('\\', '/', $relativePath));
            }

            // If no image files at all, add placeholder to images root
            if (count(File::allFiles($imagesRoot)) === 0) {
                $zip->addFromString('images/.keep', '');
            }

            $zip->close();

            // Clean up temp files except the ZIP (deleted after response)
            File::delete($excelPath);
            File::deleteDirectory($imagesRoot);

            // Ensure temp folder is removed after response
            register_shutdown_function(function () use ($basePath) {
                if (File::exists($basePath)) {
                    File::deleteDirectory($basePath);
                }
            });

            return response()->download($zipPath, 'products_export.zip')->deleteFileAfterSend(true);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            // Attempt cleanup on failure
            if (isset($basePath) && File::exists($basePath)) {
                File::deleteDirectory($basePath);
            }

            return response()->json([
                'result' => false,
                'message' => __('Failed to export selected products.'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function exportProductImages($products, string $imagesRoot): void
    {
        foreach ($products as $product) {
            $barcode = $product->barcode ?: ('product_' . $product->id);
            $productDir = $imagesRoot . '/' . $barcode;

            File::makeDirectory($productDir, 0755, true, true);

            // Track directories for ZIP (even if empty)
            $this->imageDirs[] = $productDir;

            $copiedCount = 0;

            foreach ($product->images as $index => $image) {
                $imagePath = $image->image;

                $sourcePath = $this->resolveImagePath($imagePath);
                if (!$sourcePath) {
                    continue;
                }
                $extension = pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg';
                $arrangement = $image->arrangement ?? ($index + 1);
                $targetPath = $productDir . '/' . $arrangement . '.' . $extension;

                try {
                    File::copy($sourcePath, $targetPath);
                    $copiedCount++;
                } catch (Exception $e) {
                    // Silently continue on copy failure
                }
            }

            // Also export variant images (optional, for completeness)
            foreach ($product->variants as $variant) {
                $variantDir = $productDir . '/variants/' . ($variant->sku ?? ('variant_' . $variant->id));
                File::makeDirectory($variantDir, 0755, true, true);

                $this->imageDirs[] = $variantDir;

                foreach ($variant->images as $vIndex => $vImage) {
                    $imagePath = $vImage->image;

                    $sourcePath = $this->resolveImagePath($imagePath);
                    if (!$sourcePath) {
                        continue;
                    }

                    $extension = pathinfo($sourcePath, PATHINFO_EXTENSION) ?: 'jpg';
                    $arrangement = $vImage->arrangement ?? ($vIndex + 1);
                    $targetPath = $variantDir . '/' . $arrangement . '.' . $extension;

                    try {
                        File::copy($sourcePath, $targetPath);
                        $copiedCount++;
                    } catch (Exception $e) {
                        // Silently continue on copy failure
                    }
                }
            }

            if ($copiedCount === 0) {
                // Add a placeholder file so the folder exists in ZIP for troubleshooting
                File::put($productDir . '/.keep', '');
            }
        }
    }

    public function exportTemplate()
    {
        set_time_limit(300); // 5 minutes for export processing
        return Excel::download(new ProductTemplateExport(), 'product_import_template.xlsx');
    }

    public function import(Request $request)
    {
        try {
            $validated = $request->validate([
                'zip_file' => 'required|file|mimes:zip|max:102400',
            ], [
                'zip_file.required' => __('ZIP file is required.'),
                'zip_file.mimes' => __('File must be a valid ZIP archive.'),
                'zip_file.max' => __('ZIP file size must not exceed 100MB.'),
            ]);

            DB::beginTransaction();

            $tempExtractPath = storage_path('app/temp/import_' . uniqid());
            File::makeDirectory($tempExtractPath, 0755, true, true);

            // 1) Extract and validate ZIP structure
            $zip = new ZipArchive();
            if ($zip->open($validated['zip_file']->getRealPath()) !== TRUE) {
                throw new Exception(__('Unable to open ZIP file.'));
            }

            $zip->extractTo($tempExtractPath);
            $zip->close();

            // 2) Validate ZIP contains required files
            $excelPath = $tempExtractPath . '/products.xlsx';
            $imagesDir = $tempExtractPath . '/images';

            if (!File::exists($excelPath)) {
                throw new Exception(__('ZIP file missing required products.xlsx file.'));
            }

            if (!File::exists($imagesDir)) {
                throw new Exception(__('ZIP file missing required images folder.'));
            }

            // 3) Extract and organize images by barcode
            $extractedImages = [];

            // Use helper to scan and organize images
            try {
                // Create a temporary file to simulate the zip upload for ImageImportHelper
                $imagesZipPath = $tempExtractPath . '/temp_images.zip';
                $imageZip = new ZipArchive();
                $imageZip->open($imagesZipPath, ZipArchive::CREATE);

                // Add all files from images directory to the temp zip
                $files = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($imagesDir),
                    \RecursiveIteratorIterator::LEAVES_ONLY
                );

                foreach ($files as $file) {
                    if (!$file->isDir()) {
                        $filePath = $file->getRealPath();
                        $relativePath = substr($filePath, strlen($imagesDir) + 1);
                        $imageZip->addFile($filePath, $relativePath);
                    }
                }

                $imageZip->close();

                // Now extract and organize using the helper
                $extractedImages = ImageImportHelper::extractAndOrganizeImages(
                    new \Illuminate\Http\UploadedFile($imagesZipPath, 'images.zip', 'application/zip', null, true)
                );
            } catch (Exception $e) {
                $extractedImages = [];
            }

            if (empty($extractedImages)) {
                // No images found in ZIP
            }

            // 4) Import Excel with extracted images
            $import = new ProductImport($extractedImages);

            try {
                Excel::import($import, $excelPath);
            } catch (Exception $e) {
                DB::rollBack();
                File::deleteDirectory($tempExtractPath);

                return response()->json([
                    'result' => false,
                    'message' => __('Failed to process Excel file from ZIP.'),
                    'error' => $e->getMessage(),
                    'hint' => __('Please ensure your ZIP structure matches the export format (products.xlsx + images/ folder).')
                ], 422);
            }

            $results = $import->getResults();

            // Check if there were any successful imports
            if ($results['successful'] === 0 && $results['failed'] > 0) {
                DB::rollBack();
                File::deleteDirectory($tempExtractPath);

                return response()->json([
                    'result' => false,
                    'message' => __('No products were imported. Please check the errors below.'),
                    'data' => [
                        'successful' => $results['successful'],
                        'failed' => $results['failed'],
                        'total_processed' => $results['total_processed'],
                        'errors' => $results['errors']
                    ]
                ], 422);
            }

            DB::commit();
            $this->cleanupTempFiles($extractedImages);
            File::deleteDirectory($tempExtractPath);

            $message = $results['failed'] > 0
                ? __('Products imported with some errors. :successful successful, :failed failed.', [
                    'successful' => $results['successful'],
                    'failed' => $results['failed']
                ])
                : __('All products imported successfully! :count product(s) imported.', ['count' => $results['successful']]);

            return response()->json([
                'result' => true,
                'message' => $message,
                'data' => [
                    'successful' => $results['successful'],
                    'failed' => $results['failed'],
                    'total_processed' => $results['total_processed'],
                    'errors' => $results['errors']
                ]
            ]);
        } catch (ValidationException $ve) {
            if (!empty($extractedImages)) {
                $this->cleanupTempFiles($extractedImages);
            }
            DB::rollBack();
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();

            if (!empty($extractedImages)) {
                $this->cleanupTempFiles($extractedImages);
            }

            if (isset($tempExtractPath)) {
                File::deleteDirectory($tempExtractPath);
            }

            return response()->json([
                'result' => false,
                'message' => __('Failed to import products from ZIP.'),
                'error' => $e->getMessage(),
                'hint' => __('Please ensure your ZIP file matches the export format.')
            ], 500);
        }
    }

    public function validateImport(Request $request)
    {
        try {
            $validated = $request->validate([
                'zip_file' => 'required|file|mimes:zip|max:102400',
            ], [
                'zip_file.required' => __('ZIP file is required.'),
                'zip_file.mimes' => __('File must be a valid ZIP archive.'),
                'zip_file.max' => __('ZIP file size must not exceed 100MB.'),
            ]);

            $tempExtractPath = storage_path('app/temp/validate_' . uniqid());
            File::makeDirectory($tempExtractPath, 0755, true, true);

            // Extract and validate ZIP structure
            $zip = new ZipArchive();
            if ($zip->open($validated['zip_file']->getRealPath()) !== TRUE) {
                throw new Exception(__('Unable to open ZIP file.'));
            }

            $zip->extractTo($tempExtractPath);
            $zip->close();

            // Validate ZIP contains required files
            $excelPath = $tempExtractPath . '/products.xlsx';
            $imagesDir = $tempExtractPath . '/images';

            $zipValidationResults = [
                'total_barcodes_found' => 0,
                'barcodes_with_images' => [],
                'barcodes_without_images' => [],
                'invalid_barcode_folders' => [],
                'total_images_found' => 0,
                'zip_structure_errors' => []
            ];

            // Check for required files
            if (!File::exists($excelPath)) {
                $zipValidationResults['zip_structure_errors'][] = __('ZIP file missing required products.xlsx file.');
            }

            if (!File::exists($imagesDir)) {
                $zipValidationResults['zip_structure_errors'][] = __('ZIP file missing required images folder.');
            }

            $extractedImages = [];

            // If ZIP structure is valid, extract and organize images
            if (empty($zipValidationResults['zip_structure_errors'])) {
                try {
                    // Create a temporary file to simulate the zip upload for ImageImportHelper
                    $imagesZipPath = $tempExtractPath . '/temp_images.zip';
                    $imageZip = new ZipArchive();
                    $imageZip->open($imagesZipPath, ZipArchive::CREATE);

                    // Add all files from images directory to the temp zip
                    $files = new \RecursiveIteratorIterator(
                        new \RecursiveDirectoryIterator($imagesDir),
                        \RecursiveIteratorIterator::LEAVES_ONLY
                    );

                    foreach ($files as $file) {
                        if (!$file->isDir()) {
                            $filePath = $file->getRealPath();
                            $relativePath = substr($filePath, strlen($imagesDir) + 1);
                            $imageZip->addFile($filePath, $relativePath);
                        }
                    }

                    $imageZip->close();

                    // Now extract and organize using the helper
                    $extractedImages = ImageImportHelper::extractAndOrganizeImages(
                        new \Illuminate\Http\UploadedFile($imagesZipPath, 'images.zip', 'application/zip', null, true)
                    );

                    if (!empty($extractedImages)) {
                        $zipValidationResults = ImageImportHelper::analyzeZipContents($extractedImages);
                    } else {
                        $zipValidationResults['zip_structure_errors'][] = __('ZIP images folder contains no valid barcode folders with images. Expected structure: images/[barcode]/image.jpg');
                    }
                } catch (Exception $e) {
                    $zipValidationResults['zip_structure_errors'][] = __('Error processing ZIP images folder: :error', ['error' => $e->getMessage()]);
                }
            }

            // Validate Excel file
            $excelValidationResults = [
                'total_rows' => 0,
                'valid_rows' => 0,
                'invalid_rows' => 0,
                'errors' => [],
                'warnings' => []
            ];

            if (File::exists($excelPath)) {
                $import = new ProductImport($extractedImages);
                $import->setValidationOnly(true);

                try {
                    Excel::import($import, $excelPath);
                    $excelValidationResults = $import->getValidationResults();
                } catch (Exception $e) {
                    $excelValidationResults['errors'][] = [
                        'row' => 0,
                        'barcode' => 'N/A',
                        'errors' => [$e->getMessage()]
                    ];
                }
            }

            $this->cleanupTempFiles($extractedImages);
            File::deleteDirectory($tempExtractPath);

            $combinedResults = ImageImportHelper::combineValidationResults($excelValidationResults, $zipValidationResults, $extractedImages);

            $hasErrors = $excelValidationResults['invalid_rows'] > 0 || !empty($zipValidationResults['zip_structure_errors']);

            $message = $hasErrors
                ? __('Validation completed with errors. Please review and fix the issues before importing.')
                : __('Validation successful! All :count row(s) are ready to import.', ['count' => $excelValidationResults['valid_rows']]);

            return response()->json([
                'result' => !$hasErrors,
                'message' => $message,
                'data' => $combinedResults,
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            if (!empty($extractedImages)) {
                $this->cleanupTempFiles($extractedImages);
            }
            if (isset($tempExtractPath)) {
                File::deleteDirectory($tempExtractPath);
            }

            return response()->json([
                'result' => false,
                'message' => __('Failed to validate ZIP file.'),
                'error' => $e->getMessage(),
                'hint' => __('Please ensure your ZIP file matches the export format.')
            ], 500);
        }
    }

    private function cleanupTempFiles($organizedImages)
    {
        if (empty($organizedImages)) {
            return;
        }

        $tempPaths = [];

        foreach ($organizedImages as $barcodeImages) {
            foreach ($barcodeImages as $image) {
                $tempDir = dirname($image['path']);
                $tempPaths[dirname($tempDir)] = true;
            }
        }

        foreach (array_keys($tempPaths) as $tempPath) {
            if (strpos($tempPath, storage_path('app/temp/import_')) === 0) {
                File::deleteDirectory($tempPath);
            }
        }
    }
}
