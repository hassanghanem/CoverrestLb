<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use App\Models\Product;

class SelectedProductsExport implements WithMultipleSheets
{
    private Collection $products;
    private array $locales;

    public function __construct(Collection $products)
    {
        $this->products = $products;
        $this->locales = config('app.locales', ['en']);
    }

    public function sheets(): array
    {
        return [
            new SelectedProductsSheet($this->products, $this->locales),
            new SelectedVariantsSheet($this->products, $this->locales),
            new SelectedSpecificationsSheet($this->products, $this->locales),
        ];
    }
}

class SelectedProductsSheet implements FromArray, WithHeadings, WithTitle
{
    private Collection $products;
    private array $locales;

    public function __construct(Collection $products, array $locales)
    {
        $this->products = $products;
        $this->locales = $locales;
    }

    public function headings(): array
    {
        $localeHeaders = collect($this->locales)->flatMap(fn($locale) => [
            "Name ({$locale})",
            "Short description ({$locale})",
            "Description ({$locale})",
        ])->toArray();

        return array_merge([
            'Barcode',
            'Category',
            'Brand',
            'Availability Status',
            'Price',
            'Discount',
            'Min Order Quantity',
            'Max Order Quantity',
            'Tags',
        ], $localeHeaders);
    }

    public function array(): array
    {
        return $this->products->map(function (Product $product) {
            $row = [
                $product->barcode,
                $this->translate($product->category?->name), // category name per locale
                $product->brand?->name, // brand name
                $this->formatAvailability($product->availability_status),
                $product->price,
                $product->discount,
                $product->min_order_quantity,
                $product->max_order_quantity,
                // tags: export IDs to stay compatible with ProductImport which expects numeric IDs
                $product->tags->pluck('id')->implode(','),
            ];

            foreach ($this->locales as $locale) {
                $row[] = $product->name[$locale] ?? '';
                $row[] = $product->short_description[$locale] ?? '';
                $row[] = $product->description[$locale] ?? '';
            }

            return $row;
        })->toArray();
    }

    public function title(): string
    {
        return 'Products';
    }

    private function translate($value, ?string $locale = null): string
    {
        $locale = $locale ?: $this->locales[0];

        if (is_array($value)) {
            if (isset($value[$locale]) && is_scalar($value[$locale])) {
                return (string) $value[$locale];
            }

            // Fallback: return first non-empty scalar in array to avoid array-to-string warnings
            foreach ($value as $item) {
                if (is_scalar($item) && trim((string) $item) !== '') {
                    return (string) $item;
                }
            }

            return '';
        }

        if (is_object($value) && isset($value->{$locale})) {
            return is_scalar($value->{$locale}) ? (string) $value->{$locale} : '';
        }

        return is_scalar($value) ? (string) $value : '';
    }

    private function formatAvailability(?string $status): string
    {
        $map = [
            'available' => 'Available',
            'coming_soon' => 'Coming Soon',
            'discontinued' => 'Discontinued',
            'pre_order' => 'Pre Order',
        ];

        return $map[$status] ?? 'Available';
    }
}

class SelectedVariantsSheet implements FromArray, WithHeadings, WithTitle
{
    private Collection $products;
    private array $locales;

    public function __construct(Collection $products, array $locales)
    {
        $this->products = $products;
        $this->locales = $locales;
    }

    public function headings(): array
    {
        return ['Product Barcode', 'Color', 'Size', 'Price', 'Discount', 'Quantity'];
    }

    public function array(): array
    {
        $rows = [];
        $locale = $this->locales[0];

        foreach ($this->products as $product) {
            foreach ($product->variants as $variant) {
                $rows[] = [
                    $product->barcode,
                    $this->translate($variant->color?->name ?? [], $locale),
                    $this->translate($variant->size?->name ?? [], $locale),
                    $variant->price ?? $product->price,
                    $variant->discount !== null ? $variant->discount : ($product->discount ?? 0),
                    '',
                ];
            }
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Variants';
    }

    private function translate($value, string $locale): string
    {
        if (is_array($value)) {
            if (isset($value[$locale]) && is_scalar($value[$locale])) {
                return (string) $value[$locale];
            }

            foreach ($value as $item) {
                if (is_scalar($item) && trim((string) $item) !== '') {
                    return (string) $item;
                }
            }

            return '';
        }

        if (is_object($value) && isset($value->{$locale})) {
            return is_scalar($value->{$locale}) ? (string) $value->{$locale} : '';
        }

        return is_scalar($value) ? (string) $value : '';
    }

    private function priceDelta($variantPrice, $productPrice)
    {
        if ($variantPrice === null || $productPrice === null) {
            return '';
        }

        $delta = round(((float)$variantPrice) - ((float)$productPrice), 2);
        return $delta === 0.0 ? '' : $delta;
    }
}

class SelectedSpecificationsSheet implements FromArray, WithHeadings, WithTitle
{
    private Collection $products;
    private array $locales;

    public function __construct(Collection $products, array $locales)
    {
        $this->products = $products;
        $this->locales = $locales;
    }

    public function headings(): array
    {
        $headers = ['Product Barcode'];
        foreach ($this->locales as $locale) {
            $headers[] = "Specification ({$locale})";
        }

        return $headers;
    }

    public function array(): array
    {
        $rows = [];

        foreach ($this->products as $product) {
            foreach ($product->specifications as $spec) {
                $row = [$product->barcode];
                foreach ($this->locales as $locale) {
                    $value = $spec->description[$locale] ?? '';
                    $row[] = is_scalar($value) ? (string) $value : '';
                }
                $rows[] = $row;
            }
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Specifications';
    }
}
