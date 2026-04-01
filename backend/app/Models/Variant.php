<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Str;

class Variant extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'product_id',
        'color_id',
        'size_id',
        'sku',
        'price',
        'discount',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'integer',
        'is_active' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function color()
    {
        return $this->belongsTo(Color::class);
    }

    public function size()
    {
        return $this->belongsTo(Size::class);
    }

    public function images()
    {
        return $this->hasMany(VariantImage::class);
    }

    public function stockAdjustments()
    {
        return $this->hasMany(StockAdjustment::class);
    }
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
    public function stocks()
    {
        return $this->hasMany(StockAdjustment::class)
            ->selectRaw('variant_id, warehouse_id, SUM(quantity) as quantity')
            ->groupBy('variant_id', 'warehouse_id');
    }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Variant');
    }

    public function getAvailableQuantityAttribute()
    {
        return $this->totalStock();
    }


    public static function generateSku($product, $colorId = null, $sizeId = null): string
    {
        $name = is_string($product->name) ? json_decode($product->name, true) : $product->name;
        $name = is_array($name) ? $name : ['en' => (string) $product->name];
        $base = strtoupper(Str::slug($name['en'] ?? $name['ar'] ?? 'product'));

        if ($colorId && ($color = Color::find($colorId))) {
            $colorName = is_string($color->name) ? json_decode($color->name, true) : $color->name;
            $colorName = is_array($colorName) ? $colorName : ['en' => (string) $color->name];
            $base .= '-' . strtoupper(Str::slug($colorName['en'] ?? $colorName['ar'] ?? ''));
        }

        if ($sizeId && ($size = Size::find($sizeId))) {
            $sizeName = is_string($size->name) ? json_decode($size->name, true) : $size->name;
            $sizeName = is_array($sizeName) ? $sizeName : ['en' => (string) $size->name];

            // Normalize size strings like "512 GB/12 RAM" so that separators
            // (slashes etc.) become proper dashes in the SKU segment.
            $rawSize = $sizeName['en'] ?? $sizeName['ar'] ?? '';
            $rawSize = str_replace('/', ' / ', $rawSize);
            $rawSize = preg_replace('/\s+/', ' ', $rawSize ?? '');

            $base .= '-' . strtoupper(Str::slug($rawSize));
        }

        do {
            $sku = $base . '-' . strtoupper(Str::random(4));
        } while (self::where('sku', $sku)->exists());

        return $sku;
    }

    public function getDisplaySkuAttribute(): string
    {
        $parts = [];

        // Product Name
        $productName = $this->product?->name;
        $productName = is_string($productName) ? json_decode($productName, true) : $productName;
        $productName = is_array($productName) ? $productName : ['en' => (string) $this->product?->name];
        $parts[] = strtoupper($productName['en'] ?? $productName['ar'] ?? 'PRODUCT');

        // Color Name
        if ($this->color) {
            $colorName = is_string($this->color->name) ? json_decode($this->color->name, true) : $this->color->name;
            $colorName = is_array($colorName) ? $colorName : ['en' => (string) $this->color->name];
            $parts[] = strtoupper($colorName['en'] ?? $colorName['ar'] ?? '');
        }
           // size Name
        if ($this->size) {
            $sizeName = is_string($this->size->name) ? json_decode($this->size->name, true) : $this->size->name;
            $sizeName = is_array($sizeName) ? $sizeName : ['en' => (string) $this->size->name];
            $parts[] = strtoupper($sizeName['en'] ?? $sizeName['ar'] ?? '');
        }
        return implode('-', array_filter($parts));
    }

    public function totalStock(?int $warehouseId = null): int
    {
        $query = $this->stockAdjustments();

        if ($warehouseId !== null) {
            $query->where('warehouse_id', $warehouseId);
        }

        // Sum quantity safely; returns 0 if no stock adjustments exist
        return (int) $query->sum('quantity');
    }

    public function getWarehouseStocks(): array
    {
        // Get all stock adjustments for this variant grouped by warehouse
        $stocks = StockAdjustment::where('variant_id', $this->id)
            ->selectRaw('warehouse_id, SUM(quantity) as quantity')
            ->groupBy('warehouse_id')
            ->with('warehouse')
            ->get();

        return $stocks->map(fn($stock) => [
            'warehouse_id' => $stock->warehouse_id,
            'warehouse_name' => $stock->warehouse->name ?? 'Unknown',
            'quantity' => (int) $stock->quantity,
        ])->values()->all();
    }
}
