<?php

namespace App\Models;

use App\Casts\JsonOrScalarCast;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Storage;

class Configuration extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'key',
        'value',
    ];
    protected $casts = [
        'value' => JsonOrScalarCast::class,
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
       ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('Configuration');
    }

    public static function storeImage($imageFile)
    {
        return $imageFile->store('configurations', 'public');
    }

    public static function deleteImage($imagePath)
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }
    public static function getValue(string $key, $default = null)
    {
        return self::where('key', $key)->value('value') ?? $default;
    }
}
