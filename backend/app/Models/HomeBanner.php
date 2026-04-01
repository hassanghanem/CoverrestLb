<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Translatable\HasTranslations;
use Illuminate\Database\Eloquent\Casts\Attribute;

class HomeBanner extends Model
{
    use HasFactory, LogsActivity, HasTranslations;

    protected $fillable = [
        'home_section_id',
        'image',
        'image_mobile',
        'link',
        'title',
        'subtitle',
        'arrangement',
        'is_active'
    ];
    public $translatable = [
        'title',
        'subtitle',
    ];
    protected $casts = [
        'arrangement' => 'integer',
        'is_active' => 'boolean',
    ];

    public function homeSection()
    {
        return $this->belongsTo(HomeSection::class);
    }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('HomeBanner');
    }
    protected function image(): Attribute
    {
        return new Attribute(
            get: function () {
                return asset(Storage::url($this->attributes['image']));
            }
        );
    }
    protected function imageMobile(): Attribute
    {
        return new Attribute(
            get: function () {
                return asset(Storage::url($this->attributes['image_mobile']));
            }
        );
    }

    public static function storeImage($imageFile): string
    {
        return $imageFile->store('home_banners', 'public');
    }

    public static function deleteImage($imagePath): void
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }

    public static function rearrangeAfterDelete(int $deletedArrangement): void
    {
        self::where('arrangement', '>', $deletedArrangement)
            ->decrement('arrangement');
    }
}
