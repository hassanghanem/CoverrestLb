<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\DB;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Translatable\HasTranslations;

class Product extends Model
{
    use HasFactory, LogsActivity, HasSlug, HasTranslations, Searchable;

    protected $fillable = [
        'barcode',
        'slug',
        'availability_status',
        'category_id',
        'brand_id',
        'name',
        'short_description',
        'description',
        'price',
        'discount',
        'coupon_eligible',
        'min_order_quantity',
        'max_order_quantity',
        'warranty',
        'arrangement',
    ];

    public $translatable = [
        'name',
        'short_description',
        'description',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'integer',
        'coupon_eligible' => 'boolean',
        'min_order_quantity' => 'integer',
        'max_order_quantity' => 'integer',
        'warranty' => 'string',
        'arrangement' => 'integer',
    ];

    protected $appends = ['final_price'];
    
    public function getTotalStockQuantityAttribute(): int
    {
        // Sum available_quantity (totalStock) across all variants
        return (int) $this->variants->sum(fn($variant) => (int) ($variant->available_quantity ?? $variant->totalStock()));
    }

    /**
     * Get the indexable data array for the model.
     * Returns different fields based on Scout driver (database vs meilisearch).
     */
    public function toSearchableArray(): array
    {
        $driver = config('scout.driver');

        // For database driver: only return actual table columns
        if ($driver === 'database' || $driver === 'collection' || $driver === null) {
            return [
                'id' => $this->id,
                'barcode' => $this->barcode,
                'name' => $this->name,
                'short_description' => $this->short_description,
                'description' => $this->description,
            ];
        }

        // For Meilisearch: return enhanced searchable data
        $locale = app()->getLocale();

        // Spatie Translatable stores JSON in DB but returns translated strings at runtime.
        // Use getTranslations() to reliably retrieve all locales for indexing.
        $nameTranslations = $this->getTranslations('name');
        $shortDescTranslations = $this->getTranslations('short_description');
        $descTranslations = $this->getTranslations('description');

        return [
            'id' => $this->id,
            'barcode' => $this->barcode,

            // Translated fields - current locale
            'name' => (string) ($nameTranslations[$locale] ?? $this->name ?? ''),
            'short_description' => (string) ($shortDescTranslations[$locale] ?? $this->short_description ?? ''),
            'description' => (string) ($descTranslations[$locale] ?? $this->description ?? ''),

            // All translations for comprehensive search
            'name_en' => (string) ($nameTranslations['en'] ?? ''),
            'name_ar' => (string) ($nameTranslations['ar'] ?? ''),
            'short_description_en' => (string) ($shortDescTranslations['en'] ?? ''),
            'short_description_ar' => (string) ($shortDescTranslations['ar'] ?? ''),
            'description_en' => (string) ($descTranslations['en'] ?? ''),
            'description_ar' => (string) ($descTranslations['ar'] ?? ''),

            // Relations
            'brand' => $this->brand?->name ?? '',
            'brand_id' => $this->brand_id,
            'category' => $this->category?->name ?? '',
            'category_id' => $this->category_id,
            'tags' => $this->tags->pluck('name')->join(' ') ?? '',

            // Price and availability
            // "price" is the value used for Meilisearch price filtering/sorting (mapped to final price).
            'price' => (float) $this->final_price,
            'final_price' => $this->final_price,
            'availability_status' => $this->availability_status,
            'coupon_eligible' => (bool) ($this->coupon_eligible ?? true),

            // Sorting helpers
            'created_at' => $this->created_at?->getTimestamp(),
            'discount' => (int) ($this->discount ?? 0),
        ];
    }

    /**
     * Modify the query used to retrieve models when making all of the models searchable.
     */
    protected function makeAllSearchableUsing($query)
    {
        return $query->with(['brand', 'category', 'tags']);
    }

    /**
     * Get the name of the index associated with the model.
     */
    public function searchableAs(): string
    {
        return 'products_index';
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function tags()
    {
        // Keep pivot timestamps (created_at/updated_at) in sync/attach/detach.
        return $this->belongsToMany(Tag::class, 'product_tags')->withTimestamps();
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function clicks()
    {
        return $this->hasMany(ProductClick::class);
    }

    public function variants()
    {
        return $this->hasMany(Variant::class);
    }

    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class);
    }

    public function specifications()
    {
        return $this->hasMany(ProductSpecification::class);
    }

    public function homeProductSectionItems()
    {
        return $this->hasMany(HomeProductSectionItem::class, 'product_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the reviews visible for a given client.
     *
     * - All active reviews are always visible
     * - The client's own review is visible even if inactive
     */
    public function getVisibleReviewsForClient(?int $clientId)
    {
        return $this->reviews->filter(function ($review) use ($clientId) {
            if ($review->is_active) {
                return true;
            }

            return $clientId && $review->client_id === $clientId;
        });
    }

    /**
     * Get the average rating for a given client.
     *
     * - Public average is based on active reviews only
     * - For the owning client, include their own inactive review in the average
     */
    public function getAverageRatingForClient(?int $clientId): float
    {
        $activeReviews = $this->reviews->where('is_active', true);

        $reviewsForAverage = $activeReviews;

        if ($clientId) {
            $ownReview = $this->reviews->firstWhere('client_id', $clientId);

            if ($ownReview && ! $ownReview->is_active) {
                $reviewsForAverage = $activeReviews->concat(collect([$ownReview]));
            }
        }

        return round((float) $reviewsForAverage->avg('rating'), 2);
    }

    /**
     * Get the reviews count for a given client.
     *
     * - Public count is based on active reviews only
     * - For the owning client, include their own inactive review in the count
     */
    public function getReviewsCountForClient(?int $clientId): int
    {
        $activeReviews = $this->reviews->where('is_active', true);

        $publicReviewsCount = $activeReviews->count();

        $visibleReviewsCount = $publicReviewsCount;

        if ($clientId) {
            $ownReview = $this->reviews->firstWhere('client_id', $clientId);

            if ($ownReview && ! $ownReview->is_active) {
                $visibleReviewsCount += 1;
            }
        }

        return $visibleReviewsCount;
    }

    public function stocks()
    {
        return $this->hasManyThrough(
            StockAdjustment::class,
            Variant::class,
            'product_id',
            'variant_id',
            'id',
            'id'
        )->selectRaw('variant_id, warehouse_id, SUM(quantity) as quantity')
            ->groupBy('variant_id', 'warehouse_id');
    }

    public function getFinalPriceAttribute()
    {
        return $this->price - ($this->price * $this->discount / 100);
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom(fn($model) => $model->name . ' ' . $model->barcode)
            ->saveSlugsTo('slug')
            ->slugsShouldBeNoLongerThan(80)
            ->doNotGenerateSlugsOnUpdate()
            ->usingSeparator('-')
            ->preventOverwrite();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Product');
    }

    public static function generateBarcode(): string
    {
        $prefix = '990';

        $lastBarcode = DB::table('products')
            ->where('barcode', 'like', $prefix . '%')
            ->orderBy('barcode', 'desc')
            ->value('barcode');

        $nextNumber = $lastBarcode ? intval(substr($lastBarcode, strlen($prefix))) + 1 : 1;

        return $prefix . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
    }

    public static function moveSelectedToTop(array $productIds): void
    {
        $ids = array_values(array_filter($productIds));
        if (empty($ids)) {
            return;
        }

        // Selected products first (keep their current relative order),
        // then all others, and reindex arrangements starting from 1.
        $selected = self::whereIn('id', $ids)
            ->orderBy('arrangement', 'asc')
            ->get();

        $others = self::whereNotIn('id', $ids)
            ->orderBy('arrangement', 'asc')
            ->get();

        $position = 1;
        foreach ($selected as $product) {
            $product->arrangement = $position++;
            $product->save();
        }

        foreach ($others as $product) {
            $product->arrangement = $position++;
            $product->save();
        }
    }

    public function updateAvailabilityStatus(): void
    {
        // Do not override explicitly discontinued products
        if ($this->availability_status === 'discontinued') {
            return;
        }

        // A product is considered available if ANY of its variants
        // has strictly positive stock (across all warehouses).
        $hasAvailableStock = $this->variants->contains(function ($variant) {
            return $variant->totalStock() > 0;
        });

        if ($hasAvailableStock) {
            $newStatus = 'available';
        } else {
            // If it's still coming soon and there is no stock yet,
            // keep the coming_soon status.
            if ($this->availability_status === 'coming_soon') {
                return;
            }

            $newStatus = 'out_of_stock';
        }

        if ($this->availability_status !== $newStatus) {
            $this->timestamps = false;
            $this->update(['availability_status' => $newStatus]);
            $this->timestamps = true;
        }
    }
}
