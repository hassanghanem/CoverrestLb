<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Shelf extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'warehouse_id',
        'name',
        'location',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function stock()
    {
        return $this->hasMany(StockAdjustment::class);
    }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
           ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Shelf');
    }
}
