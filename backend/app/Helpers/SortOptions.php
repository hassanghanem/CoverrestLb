<?php

namespace App\Helpers;

class SortOptions
{
    public static function list(): array
    {
        return [
            [
                'key' => 'newest',
                'label_key' => 'Newest First',
                'column' => 'products.created_at',
                'direction' => 'desc',
            ],
            [
                'key' => 'oldest',
                'label_key' => 'Oldest First',
                'column' => 'products.created_at',
                'direction' => 'asc',
            ],
            [
                'key' => 'price_htl',
                'label_key' => 'Price: High to Low',
                'column' => 'products.price',
                'direction' => 'desc',
            ],
            [
                'key' => 'price_lth',
                'label_key' => 'Price: Low to High',
                'column' => 'products.price',
                'direction' => 'asc',
            ],
            [
                'key' => 'name_asc',
                'label_key' => 'Name: A to Z',
                'column' => 'products.name',
                'direction' => 'asc',
            ],
            [
                'key' => 'name_desc',
                'label_key' => 'Name: Z to A',
                'column' => 'products.name',
                'direction' => 'desc',
            ],
            [
                'key' => 'discount_htl',
                'label_key' => 'Discount: High to Low',
                'column' => 'products.discount',
                'direction' => 'desc',
            ],
            [
                'key' => 'discount_lth',
                'label_key' => 'Discount: Low to High',
                'column' => 'products.discount',
                'direction' => 'asc',
            ],
        ];
    }

    public static function get(string $key): ?array
    {
        foreach (self::list() as $option) {
            if ($option['key'] === $key) {
                return $option;
            }
        }

        return null;
    }

    public static function keys(): array
    {
        return array_column(self::list(), 'key');
    }

    public static function all(): array
    {
        return self::list();
    }
}
