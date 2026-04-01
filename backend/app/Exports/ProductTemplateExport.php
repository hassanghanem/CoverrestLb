<?php

namespace App\Exports;

use App\Models\Category;
use App\Models\Brand;
use App\Models\Tag;
use App\Models\Color as ModelColor;
use App\Models\Size;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class ProductTemplateExport implements FromCollection, WithHeadings, WithEvents
{
    const MAX_DATA_ROWS = 250;
    const START_DATA_ROW = 2;
    const HEADER_ROW = 1;

    public function collection()
    {
        return collect();
    }

    public function headings(): array
    {
        $locales = config('app.locales', ['en']);
        $localeHeaders = collect($locales)->flatMap(fn($locale) => [
            "Name ({$locale})",
            "Short description ({$locale})",
            "Description ({$locale})"
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
            'Warranty',
            'Tags',
        ], $localeHeaders);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                try {
                    $this->validateRequiredData();
                    $this->setupTemplate($sheet);
                } catch (\Exception $e) {
                    $this->addErrorMessage($sheet, $e->getMessage());
                }
            },
        ];
    }

    private function validateRequiredData()
    {
        if (Category::count() === 0) {
            throw new \Exception('No categories found. Please create categories before exporting the template.');
        }

        if (Brand::count() === 0) {
            throw new \Exception('No brands found. Please create brands before exporting the template.');
        }
    }

    private function setupTemplate($sheet)
    {
        $workbook = $sheet->getParent();

        $this->addInstructionsSheet($workbook);
        $this->addVariantsSheet($workbook);
        $this->addSpecificationsSheet($workbook);

        $helperData = [
            'categories' => $this->getLocalizedCategories(),
            'brands' => Brand::select('id', 'name')->orderBy('id')->get()->toArray(),
            'statuses' => $this->getAvailabilityStatuses(),
            'tags' => Tag::select('id', 'name')->orderBy('id')->get()->toArray(),
            'colors' => $this->getLocalizedColors(),
            'sizes' => $this->getLocalizedSizes(),
        ];

        foreach ($helperData as $name => $data) {
            $this->createHelperSheet($workbook, $name, $data);
        }

        $this->applyTemplateStyling($sheet);
        $this->applyAllValidations($sheet);
        $this->hideHelperSheets($workbook);

        $this->activateDataSheet($sheet);
        $this->reorderSheets($workbook);
    }

    private function getAvailabilityStatuses()
    {
        return [
            ['id' => 'available', 'name' => 'Available'],
            ['id' => 'coming_soon', 'name' => 'Coming Soon'],
            ['id' => 'discontinued', 'name' => 'Discontinued'],
            ['id' => 'pre_order', 'name' => 'Pre Order'],
        ];
    }

    private function createHelperSheet($workbook, $sheetName, $data)
    {
        $helperSheet = $workbook->createSheet();
        $helperSheet->setTitle($sheetName);

        if (empty($data)) {
            $rows = [['ID', 'Name'], ['', 'No data available']];
        } else {
            $headers = array_keys($data[0]);
            $rows = [$headers];
            foreach ($data as $item) {
                $rows[] = array_values($item);
            }
        }

        $helperSheet->fromArray($rows, null, 'A1');

        // Set column widths for all columns
        $columnCount = empty($data) ? 2 : count($data[0]);
        $lastCol = Coordinate::stringFromColumnIndex($columnCount);
        
        $helperSheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E0E0E0']],
        ]);

        $helperSheet->getColumnDimension('A')->setWidth(10);
        
        // Set width for all name columns
        for ($i = 2; $i <= $columnCount; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $helperSheet->getColumnDimension($colLetter)->setWidth(25);
        }
    }

    private function addVariantsSheet($workbook)
    {
        $variantsSheet = $workbook->createSheet();
        $variantsSheet->setTitle('Variants');

        $headers = [
            'Product Barcode',
            'Color',
            'Size',
            'Price',
            'Discount',
        ];

        $variantsSheet->fromArray([$headers], null, 'A1');

        // Style the header
        $lastColumn = $variantsSheet->getHighestColumn();
        $variantsSheet->getStyle("A1:{$lastColumn}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '8E44AD']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '34495E']]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Set column widths
        $columnWidths = [
            'A' => 18, // Product Barcode
            'B' => 20, // Color
            'C' => 15, // Size
            'D' => 18, // Price
            'E' => 15, // Discount
        ];

        foreach ($columnWidths as $col => $width) {
            $variantsSheet->getColumnDimension($col)->setWidth($width);
        }

        // Add data validation for colors (dropdown from helper sheet)
        $locales = config('app.locales', ['en']);
        $defaultLocale = config('app.locale', 'en');
        $localeIndex = array_search($defaultLocale, $locales);
        if ($localeIndex === false) {
            $localeIndex = 0;
        }
        $colorColIndex = 2 + $localeIndex; // Column A is ID, B is first locale
        $colorColLetter = Coordinate::stringFromColumnIndex($colorColIndex);
        
        $colorsValidation = new DataValidation();
        $colorsValidation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_STOP)
            ->setAllowBlank(true)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setPromptTitle("Color Selection")
            ->setPrompt("Please select a color from the dropdown")
            ->setErrorTitle("Invalid Color")
            ->setError("Please select a valid color from the dropdown.");

        $colorsValidation->setFormula1("'colors'!\${$colorColLetter}$2:\${$colorColLetter}$" . self::MAX_DATA_ROWS);

        // Apply validation to color column - apply in batches for better performance
        $colorValidation = clone $colorsValidation;
        for ($row = 2; $row <= self::MAX_DATA_ROWS; $row++) {
            $variantsSheet->setDataValidation("B{$row}", clone $colorsValidation);
        }

        // Add data validation for sizes (dropdown from helper sheet)
        $sizeColIndex = 2 + $localeIndex; // Column A is ID, B is first locale
        $sizeColLetter = Coordinate::stringFromColumnIndex($sizeColIndex);
        
        $sizesValidation = new DataValidation();
        $sizesValidation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_STOP)
            ->setAllowBlank(true)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setPromptTitle("Size Selection")
            ->setPrompt("Please select a size from the dropdown (optional)")
            ->setErrorTitle("Invalid Size")
            ->setError("Please select a valid size from the dropdown.");

        $sizesValidation->setFormula1("'sizes'!\${$sizeColLetter}$2:\${$sizeColLetter}$" . self::MAX_DATA_ROWS);

        for ($row = 2; $row <= self::MAX_DATA_ROWS; $row++) {
            $variantsSheet->setDataValidation("C{$row}", clone $sizesValidation);
        }
        $variantsSheet->getStyle("C2:C" . self::MAX_DATA_ROWS)->getFont()->setColor(new Color('FF000000'));

        // Add numeric validations
        $numericValidations = [
            'D' => $this->createNumericValidation(0, 'Price: enter positive number (e.g., 10). Leave blank to use base price.', 'Price', null, DataValidation::TYPE_DECIMAL, true),
            'E' => $this->createNumericValidation(0, 'Discount: enter percentage 0-100. Leave blank to use product discount.', 'Discount', 100, DataValidation::TYPE_WHOLE, true),
        ];

        foreach ($numericValidations as $column => $validation) {
            for ($row = 2; $row <= self::MAX_DATA_ROWS; $row++) {
                $variantsSheet->setDataValidation("{$column}{$row}", clone $validation);
            }
        }

        // Style data rows
        $lightPurpleColor = new Color('FFF3E8F5');
        $variantsSheet->getStyle("A2:" . $lastColumn . self::MAX_DATA_ROWS)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'DDDDDD']]],
        ]);

        $variantsSheet->getStyle("B2:B" . self::MAX_DATA_ROWS)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->setStartColor($lightPurpleColor);

        $variantsSheet->getRowDimension(1)->setRowHeight(25);
    }

    private function addSpecificationsSheet($workbook)
    {
        $specificationsSheet = $workbook->createSheet();
        $specificationsSheet->setTitle('Specifications');

        $locales = config('app.locales', ['en']);
        
        // Build headers dynamically based on locales
        $headers = ['Product Barcode'];
        foreach ($locales as $locale) {
            $headers[] = "Specification ({$locale})";
        }

        $specificationsSheet->fromArray([$headers], null, 'A1');

        // Style the header
        $lastColumn = $specificationsSheet->getHighestColumn();
        $specificationsSheet->getStyle("A1:{$lastColumn}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '16A085']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '34495E']]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Set column widths
        $specificationsSheet->getColumnDimension('A')->setWidth(18); // Product Barcode
        
        foreach (range('B', chr(66 + count($locales) - 1)) as $col) {
            $specificationsSheet->getColumnDimension($col)->setWidth(40);
        }

        // Add validation for barcode column (optional reference)
        $barcodeValidation = new DataValidation();
        $barcodeValidation->setType(DataValidation::TYPE_CUSTOM)
            ->setErrorStyle(DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(false)
            ->setShowInputMessage(true)
            ->setPromptTitle("Product Barcode")
            ->setPrompt("Enter the product barcode from the Products sheet. Each specification row must match a product barcode.");

        for ($row = 2; $row <= self::MAX_DATA_ROWS; $row++) {
            $specificationsSheet->setDataValidation("A{$row}", clone $barcodeValidation);
        }

        // Style data rows
        $lightGreenColor = new Color('FFE8F8F5');
        $specificationsSheet->getStyle("A2:" . $lastColumn . self::MAX_DATA_ROWS)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'DDDDDD']]],
        ]);

        // Highlight specification columns
        $specColEnd = chr(66 + count($locales) - 1);
        $specificationsSheet->getStyle("B2:{$specColEnd}" . self::MAX_DATA_ROWS)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->setStartColor($lightGreenColor);

        $specificationsSheet->getRowDimension(1)->setRowHeight(25);

        // Add a comment to the header explaining usage
        $specificationsSheet->getComment('A1')
            ->getText()
            ->createTextRun("Add multiple specification rows for each product\nExample:\n12345 | Waterproof\n12345 | Shock Resistant\n12345 | 5G Compatible");
        $specificationsSheet->getComment('A1')->setWidth('350pt');
        $specificationsSheet->getComment('A1')->setHeight('100pt');
    }

    private function addInstructionsSheet($workbook)
    {
        $sheet = $workbook->createSheet();
        $sheet->setTitle('Instructions');
        $sheet->setSheetState(Worksheet::SHEETSTATE_VISIBLE);

        $tags = Tag::select('id', 'name')->orderBy('id')->get();
        $tagExamples = $tags->take(5)->pluck('id')->join(', ');

        $locales = config('app.locales', ['en']);

        $instructions = [
            ['PRODUCT IMPORT TEMPLATE - INSTRUCTIONS'],
            [''],
            ['QUICK START:'],
            ['1. Go to "Products" sheet (enter main product data)'],
            ['2. Go to "Specifications" sheet to add multiple specs per product'],
            ['3. Go to "Variants" sheet to add product variants (colors, sizes, stock)'],
            ['4. Start entering data from ROW 2 in all sheets'],
            ['5. Use dropdowns for Category, Brand, Status, Color, and Size'],
            [''],
            ['PRODUCTS SHEET - REQUIRED FIELDS:'],
            ['• Barcode: Leave blank to auto-generate (used to link variants and specs)'],
            ['• Category, Brand, Status: Required (dropdown)'],
            ['• Price: Positive number (base price)'],
            ['• Min Order Quantity: Whole number ≥ 1'],
            ['• Name, Description: Required per language'],
            [''],
            ['PRODUCTS SHEET - OPTIONAL FIELDS:'],
            ['• Discount: 0–100 (%)'],
            ['• Max Order Quantity: blank = no limit'],
            ['• Tags: Select from dropdown or enter comma-separated IDs (e.g., 1,5,8)'],
            [''],
            ['SPECIFICATIONS SHEET (NEW - Recommended):'],
            ['• Product Barcode: Must match barcode from Products sheet'],
            ['• Specification: One specification per row for each language'],
            ['• Add multiple rows with same barcode for multiple specifications'],
            ['• Example: Barcode 12345 can have 3 rows for 3 different specs'],
            [''],
            ['VARIANTS SHEET:'],
            ['• Product Barcode: Must match barcode from Products sheet'],
            ['• Color: Select from dropdown (optional)'],
            ['• Size: Select from dropdown (optional)'],
            ['• Price: Price adjustment amount - positive to increase, negative to decrease (optional)'],
            ['• Discount: Percentage 0-100 (optional, leave blank to use product discount)'],
            [''],
            ['VARIANT IMAGES (ZIP FILE):'],
            ['• For NEW variants without SKU yet, use folder name: "ColorName" or "ColorName-SizeName"'],
            ['• For EXISTING variants, use folder name: SKU (e.g., PRD-123456-CLR-5)'],
            ['• Example structure: images/[barcode]/variants/Red/image1.jpg'],
            ['• Example with size: images/[barcode]/variants/Blue-Large/image1.jpg'],
            [''],
            ['EXAMPLES:'],
            ["• Tags: {$tagExamples}"],
            ['• Variants: One product can have multiple variant rows with same barcode'],
            ['• Specifications: One product can have multiple specification rows with same barcode'],
            [''],
            ['SPECIFICATIONS EXAMPLES:'],
        ];

        foreach ($locales as $locale) {
            $instructions[] = ["  Row 1 - Barcode 12345 | {$locale}: Waterproof"];
            $instructions[] = ["  Row 2 - Barcode 12345 | {$locale}: Shock Resistant"];
            $instructions[] = ["  Row 3 - Barcode 12345 | {$locale}: 5G Compatible"];
            break; // Only show example for first locale to keep it concise
        }

        $instructions = array_merge($instructions, [
            [''],
            ['UPDATING PRODUCTS:'],
            ['• Use existing barcode to update products'],
            ['• NEW products MUST have at least one image in the ZIP file'],
            ['• Existing products: Images optional (only if you want to replace them)'],
            ['• Add/update variants in the Variants sheet using product barcode'],
            ['• Add/update specifications in the Specifications sheet using product barcode'],
            [''],
            ['TROUBLESHOOTING:'],
            ['• Check hidden sheets for valid dropdown values'],
            ['• All barcodes in Variants and Specifications sheets must exist in Products sheet'],
            ['• Numeric fields must be numbers only'],
            ['• All localized name/description fields required for each language'],
            ['• Specifications sheet is optional - only use if product has specs'],
        ]);

        $sheet->fromArray($instructions, null, 'A1');
        $sheet->getColumnDimension('A')->setWidth(90);

        $sheet->mergeCells('A1:D1');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E88E5']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sectionColors = [
            'quick' => 'E8F5E9',
            'required' => 'E3F2FD',
            'optional' => 'FFFDE7',
            'variants' => 'F3E5F5',
            'examples' => 'F3E5F5',
            'updating' => 'F1F8E9',
            'troubleshooting' => 'ECEFF1',
        ];

        foreach (range(3, count($instructions)) as $i) {
            $text = trim($sheet->getCell("A{$i}")->getValue());

            if ($text === 'QUICK START:') {
                $bg = $sectionColors['quick'];
            } elseif ($text === 'PRODUCTS SHEET - REQUIRED FIELDS:') {
                $bg = $sectionColors['required'];
            } elseif ($text === 'PRODUCTS SHEET - OPTIONAL FIELDS:') {
                $bg = $sectionColors['optional'];
            } elseif ($text === 'VARIANTS SHEET:') {
                $bg = $sectionColors['variants'];
            } elseif ($text === 'EXAMPLES:') {
                $bg = $sectionColors['examples'];
            } elseif ($text === 'UPDATING PRODUCTS:') {
                $bg = $sectionColors['updating'];
            } elseif ($text === 'TROUBLESHOOTING:') {
                $bg = $sectionColors['troubleshooting'];
            } else {
                continue;
            }

            $sheet->getStyle("A{$i}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => '0D47A1']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bg]],
            ]);
        }

        $sheet->getStyle('A1:A' . count($instructions))
            ->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);

        for ($i = 1; $i <= count($instructions); $i++) {
            $sheet->getRowDimension($i)->setRowHeight(20);
        }
    }

    private function applyTemplateStyling($sheet)
    {
        $locales = config('app.locales', ['en']);
        $nameDescriptionColumns = count($locales) * 3;
        $basicColumnsEnd = 9;
        $nameDescriptionStart = 10;
        $nameDescriptionEnd = $nameDescriptionStart + $nameDescriptionColumns - 1;

        $columnWidths = [
            'A' => 18, // Barcode
            'B' => 25, // Category
            'C' => 25, // Brand
            'D' => 20, // Status
            'E' => 15, // Price
            'F' => 15, // Discount
            'G' => 18, // Min Qty
            'H' => 18, // Max Qty
            'I' => 30, // Tags
        ];

        for ($i = $nameDescriptionStart; $i <= $nameDescriptionEnd; $i++) {
            $colLetter = Coordinate::stringFromColumnIndex($i);
            $columnWidths[$colLetter] = 20;
        }

        foreach ($columnWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        $lastColumn = $sheet->getHighestColumn();
        $sheet->getStyle("A" . self::HEADER_ROW . ":{$lastColumn}" . self::HEADER_ROW)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2C3E50']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '34495E']]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        $sheet->getRowDimension(self::HEADER_ROW)->setRowHeight(25);
        $this->styleDataRows($sheet, $nameDescriptionStart, $nameDescriptionEnd);
    }

    private function styleDataRows($sheet, $nameDescriptionStart, $nameDescriptionEnd)
    {
        $lastColumn = $sheet->getHighestColumn();

        $lightGrayColor = new Color('FFE8F5E8');
        $lightYellowColor = new Color('FFFFF8E1');
        $veryLightGrayColor = new Color('FFF8F9FA');
        $lightBlueColor = new Color('FFE8F4FD');

        $baseStyle = [
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'DDDDDD']]],
        ];

        $dataRange = "A" . self::START_DATA_ROW . ":" . $lastColumn . self::MAX_DATA_ROWS;
        $sheet->getStyle($dataRange)->applyFromArray($baseStyle);

        // Apply fill colors to ranges
        $sheet->getStyle("B" . self::START_DATA_ROW . ":D" . self::MAX_DATA_ROWS)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->setStartColor($veryLightGrayColor);

        $sheet->getStyle("E" . self::START_DATA_ROW . ":H" . self::MAX_DATA_ROWS)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->setStartColor($lightYellowColor);

        $sheet->getStyle("E" . self::START_DATA_ROW . ":H" . self::MAX_DATA_ROWS)->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        $sheet->getStyle("I" . self::START_DATA_ROW . ":I" . self::MAX_DATA_ROWS)->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->setStartColor($lightGrayColor);

        $sheet->getStyle("I" . self::START_DATA_ROW . ":I" . self::MAX_DATA_ROWS)->getFont()
            ->setColor(new Color('FF006400'));

        // Apply colors to name/description columns range
        if ($nameDescriptionStart <= $nameDescriptionEnd) {
            $startColLetter = Coordinate::stringFromColumnIndex($nameDescriptionStart);
            $endColLetter = Coordinate::stringFromColumnIndex($nameDescriptionEnd);
            $sheet->getStyle("{$startColLetter}" . self::START_DATA_ROW . ":{$endColLetter}" . self::MAX_DATA_ROWS)->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor($lightBlueColor);
        }
    }

    private function applyAllValidations($sheet)
    {
        $dropdownValidations = [
            'B' => ['categories', 'Category'],
            'C' => ['brands', 'Brand'],
            'D' => ['statuses', 'Status']
        ];

        foreach ($dropdownValidations as $column => [$sheetName, $type]) {
            $validation = $this->createDropdownValidation($sheetName, $type);
            $this->applyValidationToColumn($sheet, $column, $validation);
            $sheet->getStyle("{$column}" . self::START_DATA_ROW . ":{$column}" . self::MAX_DATA_ROWS)
                ->getFont()->setColor(new Color(Color::COLOR_BLUE));
        }

        $inputValidations = [
            'E' => $this->createNumericValidation(0, 'Price must be a positive number (e.g., 99.99)', 'Price Validation'),
            'F' => $this->createNumericValidation(0, 'Discount must be between 0 and 100 (e.g., 10 for 10%)', 'Discount Validation', 100),
            'G' => $this->createNumericValidation(1, 'Minimum order quantity must be at least 1', 'Minimum Quantity', null, DataValidation::TYPE_WHOLE),
            'H' => $this->createNumericValidation(1, 'Maximum order quantity must be at least 1 (leave blank for no limit)', 'Maximum Quantity', null, DataValidation::TYPE_WHOLE, true),
        ];

        foreach ($inputValidations as $column => $validation) {
            $this->applyValidationToColumn($sheet, $column, $validation);
        }

        $this->addIdListValidations($sheet);
    }

    private function createDropdownValidation($sheetName, $type)
    {
        $validation = new DataValidation();
        $validation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_STOP)
            ->setAllowBlank(false)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(true)
            ->setShowDropDown(true)
            ->setPromptTitle("{$type} Selection")
            ->setPrompt("Please select a {$type} from the dropdown")
            ->setErrorTitle("Invalid {$type}")
            ->setError("Please select a valid {$type} from the dropdown.");

        $defaultLocale = config('app.locale', 'en');
        $columnIndex = 2;
        if ($sheetName === 'categories') {
            $locales = config('app.locales', ['en']);
            $localeIndex = array_search($defaultLocale, $locales);
            if ($localeIndex !== false) {
                $columnIndex = 2 + $localeIndex;
            }
        }

        $colLetter = Coordinate::stringFromColumnIndex($columnIndex);
        $validation->setFormula1("'{$sheetName}'!\${$colLetter}$2:\${$colLetter}$" . self::MAX_DATA_ROWS);

        return $validation;
    }

    private function createNumericValidation($min, $prompt, $title, $max = null, $type = DataValidation::TYPE_DECIMAL, $allowBlank = false)
    {
        $validation = new DataValidation();
        $validation->setType($type)
            ->setOperator($max ? DataValidation::OPERATOR_BETWEEN : DataValidation::OPERATOR_GREATERTHANOREQUAL)
            ->setFormula1($min)
            ->setFormula2($max)
            ->setAllowBlank($allowBlank)
            ->setShowInputMessage(true)
            ->setPromptTitle($title)
            ->setPrompt($prompt);
        return $validation;
    }

    private function addIdListValidations($sheet)
    {
        // Create tags input validation (allows comma-separated IDs)
        // Note: Excel doesn't support true multi-select dropdowns, so we use custom validation
        $tagsValidation = new DataValidation();
        $tagsValidation->setType(DataValidation::TYPE_CUSTOM)
            ->setErrorStyle(DataValidation::STYLE_INFORMATION)
            ->setAllowBlank(true)
            ->setShowInputMessage(true)
            ->setShowErrorMessage(false) // Don't block input, just show helpful message
            ->setPromptTitle("Tags Input (Multiple Selection)")
            ->setPrompt("Enter comma-separated tag IDs (e.g., 1,5,8 for multiple tags or just 1 for single tag). Check 'tags' sheet for available IDs.");

        $this->applyValidationToColumn($sheet, 'I', $tagsValidation);
        
        // Add comment/note to the header to make it extra clear
        $sheet->getComment('I1')->getText()->createTextRun("Enter multiple tag IDs separated by commas\nExample: 1,5,8\nSee 'tags' sheet for available tag IDs");
        $sheet->getComment('I1')->setWidth('300pt');
        $sheet->getComment('I1')->setHeight('80pt');
    }

    private function applyValidationToColumn($sheet, $column, DataValidation $validation)
    {
        for ($row = self::START_DATA_ROW; $row <= self::MAX_DATA_ROWS; $row++) {
            $sheet->setDataValidation("{$column}{$row}", clone $validation);
        }
    }

    private function hideHelperSheets($workbook)
    {
        foreach (['categories', 'brands', 'statuses', 'colors', 'sizes'] as $title) {
            if ($sheet = $workbook->getSheetByName($title)) {
                $sheet->setSheetState(Worksheet::SHEETSTATE_HIDDEN);
            }
        }
    }

    private function activateDataSheet($sheet)
    {
        $sheet->setTitle('Products');
        $workbook = $sheet->getParent();
        $workbook->setActiveSheetIndexByName('Products');
    }

    private function reorderSheets($workbook)
    {
        $instructionsSheet = $workbook->getSheetByName('Instructions');
        $productsSheet = $workbook->getSheetByName('Products');
        $specificationsSheet = $workbook->getSheetByName('Specifications');
        $variantsSheet = $workbook->getSheetByName('Variants');

        $sheets = $workbook->getAllSheets();

        $orderedSheets = [];

        if ($instructionsSheet) {
            $orderedSheets[] = $instructionsSheet;
        }

        if ($productsSheet) {
            $orderedSheets[] = $productsSheet;
        }

        if ($specificationsSheet) {
            $orderedSheets[] = $specificationsSheet;
        }

        if ($variantsSheet) {
            $orderedSheets[] = $variantsSheet;
        }

        foreach ($sheets as $sheet) {
            $title = $sheet->getTitle();
            if (!in_array($title, ['Instructions', 'Products', 'Specifications', 'Variants'])) {
                $orderedSheets[] = $sheet;
            }
        }

        $workbook->removeSheetByIndex(0);
        foreach ($workbook->getAllSheets() as $oldSheet) {
            $workbook->removeSheetByIndex(0);
        }

        foreach ($orderedSheets as $sheet) {
            $workbook->addSheet($sheet);
        }

        $workbook->setActiveSheetIndexByName('Products');
    }

    private function getLocalizedCategories()
    {
        $locales = config('app.locales', ['en']);
        $categories = Category::orderBy('id')->get();

        $rows = [];
        foreach ($categories as $cat) {
            $row = ['id' => $cat->id];
            foreach ($locales as $locale) {
                $row["name_{$locale}"] = $cat->getTranslation('name', $locale) ?? '';
            }
            $rows[] = $row;
        }

        return $rows;
    }

    private function getLocalizedColors()
    {
        $locales = config('app.locales', ['en']);
        $colors = ModelColor::orderBy('id')->get();

        $rows = [];
        foreach ($colors as $color) {
            $row = ['id' => $color->id];
            foreach ($locales as $locale) {
                app()->setLocale($locale);
                $row["name_{$locale}"] = $color->translatedName;
            }
            $rows[] = $row;
        }

        app()->setLocale(config('app.locale', 'en'));

        return $rows;
    }
    private function getLocalizedSizes()
    {
        $locales = config('app.locales', ['en']);
        $sizes = Size::orderBy('id')->get();

        $rows = [];
        foreach ($sizes as $size) {
            $row = ['id' => $size->id];
            foreach ($locales as $locale) {
                $row["name_{$locale}"] = $size->getTranslation('name', $locale);
            }
            $rows[] = $row;
        }

        return $rows;
    }

    private function addErrorMessage($sheet, $message)
    {
        $sheet->fromArray([[]], null, 'A1');
        $sheet->setCellValue('A1', 'ERROR GENERATING TEMPLATE');
        $sheet->setCellValue('A2', $message);

        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E74C3C']],
        ]);

        $sheet->getColumnDimension('A')->setWidth(50);
    }
}
