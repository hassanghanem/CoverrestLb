<?php

namespace App\Services;

use App\Models\Product;

class ProductService
{
    /**
     * Get the base product query with all necessary relations and filters.
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function baseProductQuery()
    {
        return Product::with([
            'category',
            'brand',
            'images' => fn($q) => $q->where('is_active', true)->orderBy('arrangement', 'asc'),
            'variants' => fn($q) => $q->where('is_active', true)->with([
                'color',
                'size',
                'stocks',
                'images' => fn($query) => $query->where('is_active', true)->orderBy('arrangement', 'asc'),
            ]),
            'stocks',
            'tags',
            'specifications',
            'reviews' => fn($q) => $q->orderBy('id', 'desc')->take(5),
            'homeProductSectionItems' => fn($q) => $q->where('is_active', true)->orderBy('arrangement', 'asc'),
        ])
            ->where('availability_status', '!=', 'discontinued')
            ->whereHas('category', function ($q) {
                $q->where('is_active', 1);
            })
            ->whereHas('brand', function ($q) {
                $q->where('is_active', 1);
            });
    }
}
