<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VariantImage extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'variant_id',
        'image',
        'is_active',
        'arrangement',
    ];

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('VariantImage');
    }

    protected function image(): Attribute
    {
        return new Attribute(
            get: function () {
                return asset(Storage::url($this->attributes['image']));
            }
        );
    }
    public static function getNextArrangement($variantId = null)
    {
        $query = self::query();
        if ($variantId) {
            $query->where('variant_id', $variantId);
        }
        $maxArrangement = $query->max('arrangement') ?? 0;
        return $maxArrangement + 1;
    }

    public static function updateArrangement(VariantImage $variantImage, $newArrangement)
    {
        if ($variantImage->arrangement != $newArrangement) {
            self::where('arrangement', $newArrangement)->where('variant_id', $variantImage->variant_id)->update(['arrangement' => $variantImage->arrangement]);
            return $newArrangement;
        }
        return $variantImage->arrangement;
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
    public static function shiftArrangementsForNewImage($variantId, $startArrangement)
    {
        self::where('variant_id', $variantId)
            ->where('arrangement', '>=', $startArrangement)
            ->increment('arrangement');
    }
    public static function storeImageFromPath($filePath, $variantId)
    {
        $fileName = uniqid() . '_' . Str::random(10) . '.' . pathinfo($filePath, PATHINFO_EXTENSION);
        $fullPath = 'products/' . $fileName;

        Storage::disk('public')->put($fullPath, file_get_contents($filePath));

        return $fullPath;
    }
}
