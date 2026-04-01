<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Translatable\HasTranslations;

class HomeProductSectionItem extends Model
{
    use HasFactory, LogsActivity, HasTranslations;

    protected $fillable = [
        'home_section_id',
        'product_id',
        'arrangement',
        'is_active'
    ];

    protected $casts = [
        'arrangement' => 'integer',
        'is_active' => 'boolean',
    ];

    public function homeSection()
    {
        return $this->belongsTo(HomeSection::class);
    }

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
            ->useLogName('HomeProductSectionItem');
    }


    public static function rearrangeAfterDelete(int $deletedArrangement): void
    {
        self::where('arrangement', '>', $deletedArrangement)
            ->decrement('arrangement');
    }
}
