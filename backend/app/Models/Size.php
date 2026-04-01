<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\Translatable\HasTranslations;


class Size extends Model
{
    use HasFactory, LogsActivity, HasTranslations;

    public $translatable = ['name'];
    protected $fillable = [
        'name',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Size');
    }

    protected function translatedName(): Attribute
    {
        return Attribute::get(fn() => $this->getTranslation('name', app()->getLocale()));
    }

    public function getDescriptionForEvent(string $eventName): string
    {
        return strtolower(class_basename($this)) . '.' . $eventName;
    }

    public function variants()
    {
        return $this->hasMany(Variant::class);
    }

    protected static function booted(): void
    {
        // When a size name changes, regenerate SKUs for all variants using
        // this size so the SKU stays in sync with product name + color + size.
        static::saved(function (self $size): void {
            if (!$size->wasChanged('name')) {
                return;
            }

            Variant::where('size_id', $size->id)
                ->with('product')
                ->chunkById(50, function ($variants) {
                    foreach ($variants as $variant) {
                        if (!$variant->product) {
                            continue;
                        }

                        $variant->sku = Variant::generateSku($variant->product, $variant->color_id, $variant->size_id);
                        $variant->saveQuietly();
                    }
                });
        });
    }
}
