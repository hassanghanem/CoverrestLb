<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Translatable\HasTranslations;

class HomeSection extends Model
{
    use HasFactory, LogsActivity, HasTranslations;

    protected $fillable = [
        'type',
        'title',
        'arrangement',
        'is_active',
    ];

    public $translatable = ['title'];

    protected $casts = [
        'is_active' => 'boolean',
        'arrangement' => 'integer',
        'title' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('HomeSection');
    }

    public function banners()
    {
        return $this->hasMany(HomeBanner::class);
    }

    public function productSectionItems()
    {
        return $this->hasMany(HomeProductSectionItem::class);
    }

    public static function rearrangeAfterDelete($deletedArrangement)
    {
        self::where('arrangement', '>', $deletedArrangement)
            ->decrement('arrangement');
    }

    public static function updateArrangement(HomeSection $home_section, $newArrangement)
    {
        if ($home_section->arrangement != $newArrangement) {
            self::where('arrangement', $newArrangement)->update(['arrangement' => $home_section->arrangement]);
            return $newArrangement;
        }
        return $home_section->arrangement;
    }
}
