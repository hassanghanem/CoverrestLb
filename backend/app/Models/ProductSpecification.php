<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Translatable\HasTranslations;

class ProductSpecification extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'product_id',
        'description',
    ];

    public $translatable = ['description'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
