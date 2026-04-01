<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Spatie\Translatable\HasTranslations;

class Color extends Model
{
    use HasFactory, LogsActivity, HasTranslations;
    public $translatable = ['name'];

    protected $fillable = [
        'name',
        'code',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Color');
    }
    protected function translatedName(): Attribute
    {
        return Attribute::get(fn() => $this->getTranslation('name', app()->getLocale()));
    }

    public function variants()
    {
        return $this->hasMany(Variant::class);
    }

    protected static function booted(): void
    {
        // When a color name changes, regenerate SKUs for all variants using
        // this color so the SKU stays in sync with product name + color + size.
        static::saved(function (self $color): void {
            if (!$color->wasChanged('name')) {
                return;
            }

            Variant::where('color_id', $color->id)
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
