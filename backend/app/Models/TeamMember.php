<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Translatable\HasTranslations;


class TeamMember extends Model
{
    use HasFactory, LogsActivity, HasTranslations;

    public $translatable = ['name', 'occupation'];

    protected $fillable = [
        'name',
        'occupation',
        'image',
        'arrangement',
        'is_active',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logOnly($this->fillable)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('TeamMember');
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

    public static function updateArrangement(TeamMember $team_member, $newArrangement)
    {
        if ($team_member->arrangement != $newArrangement) {
            self::where('arrangement', $newArrangement)->update(['arrangement' => $team_member->arrangement]);
            return $newArrangement;
        }
        return $team_member->arrangement;
    }

    public static function rearrangeAfterDelete($deletedArrangement)
    {
        self::where('arrangement', '>', $deletedArrangement)
            ->decrement('arrangement');
    }

    public static function storeImage($imageFile)
    {
        return $imageFile->store('team_members', 'public');
    }

    public static function deleteImage($imagePath)
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }
}
