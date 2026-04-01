<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Tag extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name',
    ];
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_tags')->withTimestamps();
    }
    
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
          ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Tag');
    }
}
