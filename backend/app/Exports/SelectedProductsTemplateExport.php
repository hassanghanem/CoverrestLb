<?php

namespace App\Exports;

use App\Models\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithEvents;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Maatwebsite\Excel\Events\AfterSheet;

class SelectedProductsTemplateExport extends ProductTemplateExport implements WithEvents
{
    private Collection $products;
    private array $locales;

    public function __construct(Collection $products)
    {
        $this->products = $products;
        $this->locales = config('app.locales', ['en']);
    }

    public function registerEvents(): array
    {
        $baseEvents = parent::registerEvents();
        $baseAfter = $baseEvents[AfterSheet::class] ?? null;

        $baseEvents[AfterSheet::class] = function (AfterSheet $event) use ($baseAfter) {
            // Run base styling/template setup
            if ($baseAfter) {
                $baseAfter($event);
            }

            $workbook = $event->sheet->getDelegate()->getParent();

            // Fill Products sheet
            $productsSheet = $workbook->getSheetByName('Products') ?? $event->sheet->getDelegate();
            $this->fillProductsSheet($productsSheet);

            // Fill Variants sheet
            $variantsSheet = $workbook->getSheetByName('Variants');
            if ($variantsSheet) {
                $this->fillVariantsSheet($variantsSheet);
            }

            // Fill Specifications sheet
            $specsSheet = $workbook->getSheetByName('Specifications');
            if ($specsSheet) {
                $this->fillSpecificationsSheet($specsSheet);
            }
        };

        return $baseEvents;
    }

    private function fillProductsSheet(Worksheet $sheet): void
    {
        $startRow = self::START_DATA_ROW ?? 2;
        $rowNum = $startRow;

        foreach ($this->products as $product) {
            $col = 1;

            // Fixed columns
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->barcode);
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $this->translate($product->category?->name));
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->brand?->name);
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $this->formatAvailability($product->availability_status));
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->price);
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->discount);
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->min_order_quantity);
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->max_order_quantity);
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->warranty);
            $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->tags->pluck('id')->implode(','));

            // Localized name/short/description
            foreach ($this->locales as $locale) {
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $this->translate($product->name, $locale));
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $this->translate($product->short_description, $locale));
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $this->translate($product->description, $locale));
            }

            $rowNum++;
        }
    }

    private function fillVariantsSheet(Worksheet $sheet): void
    {
        $rowNum = 2; // header in row 1 per template
        $locale = $this->locales[0];

        foreach ($this->products as $product) {
            foreach ($product->variants as $variant) {
                $col = 1;
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->barcode);
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $this->translate($variant->color?->name, $locale));
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $this->translate($variant->size?->name, $locale));
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $variant->price ?? $product->price);
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $variant->discount !== null ? $variant->discount : ($product->discount ?? 0));
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, ''); // quantity left empty
                $rowNum++;
            }
        }
    }

    private function fillSpecificationsSheet(Worksheet $sheet): void
    {
        $rowNum = 2; // header in row 1 per template

        foreach ($this->products as $product) {
            foreach ($product->specifications as $spec) {
                $col = 1;
                $sheet->setCellValueByColumnAndRow($col++, $rowNum, $product->barcode);
                
                // Get all translations for description
                $descriptions = $spec->getTranslations('description');
                
                foreach ($this->locales as $locale) {
                    $value = $descriptions[$locale] ?? '';
                    $sheet->setCellValueByColumnAndRow($col++, $rowNum, is_scalar($value) ? (string)$value : '');
                }
                $rowNum++;
            }
        }
    }

    private function translate($value, ?string $locale = null): string
    {
        $locale = $locale ?: $this->locales[0];

        if (is_array($value)) {
            if (isset($value[$locale]) && is_scalar($value[$locale])) {
                return (string) $value[$locale];
            }
            foreach ($value as $item) {
                if (is_scalar($item) && trim((string)$item) !== '') {
                    return (string)$item;
                }
            }
            return '';
        }

        if (is_object($value) && isset($value->{$locale})) {
            return is_scalar($value->{$locale}) ? (string)$value->{$locale} : '';
        }

        return is_scalar($value) ? (string)$value : '';
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



    private function priceDelta($variantPrice, $productPrice)
    {
        if ($variantPrice === null || $productPrice === null) {
            return '';
        }

        $delta = round(((float)$variantPrice) - ((float)$productPrice), 2);
        return $delta === 0.0 ? '' : $delta;
    }
}
