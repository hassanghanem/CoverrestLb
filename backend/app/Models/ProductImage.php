<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImage extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'product_id',
        'image',
        'is_active',
        'arrangement',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('ProductImage');
    }

    protected function image(): Attribute
    {
        return new Attribute(
            get: function () {
                return asset(Storage::url($this->attributes['image']));
            }
        );
    }
    public static function getNextArrangement()
    {
        $maxArrangement = self::max('arrangement') ?? 0;
        return $maxArrangement + 1;
    }

    public static function updateArrangement(ProductImage $productImage, $newArrangement)
    {
        if ($productImage->arrangement != $newArrangement) {
            self::where('arrangement', $newArrangement)->update(['arrangement' => $productImage->arrangement]);
            return $newArrangement;
        }
        return $productImage->arrangement;
    }
    public static function rearrangeAfterDelete($deletedArrangement)
    {
        self::where('arrangement', '>', $deletedArrangement)
            ->decrement('arrangement');
    }

    public static function storeImage($imageFile)
    {
        $extension = $imageFile->getClientOriginalExtension() ?: ($imageFile->extension() ?: 'jpg');
        $fileName = uniqid() . '_' . Str::random(10) . '.' . $extension;
        return $imageFile->storeAs('products', $fileName, 'public');
    }
    public static function deleteImage($imagePath)
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }
    public static function shiftArrangementsForNewImage($productId, $startArrangement)
    {
        self::where('product_id', $productId)
            ->where('arrangement', '>=', $startArrangement)
            ->increment('arrangement');
    }
    public static function storeImageFromPath($filePath, $productId)
{
    $fileName = uniqid() . '_' . Str::random(10) . '.' . pathinfo($filePath, PATHINFO_EXTENSION);
    $fullPath = 'products/' . $fileName;
    
    Storage::disk('public')->put($fullPath, file_get_contents($filePath));
    
    return $fullPath;
}
}
