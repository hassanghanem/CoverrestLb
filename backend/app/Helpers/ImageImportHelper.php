<?php

namespace App\Helpers;

use ZipArchive;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Exceptions\ImportException;

class ImageImportHelper
{
    public static function extractAndOrganizeImages($zipFile)
    {
        $zip = new ZipArchive();
        $extractPath = storage_path('app/temp/import_' . uniqid());

        if ($zip->open($zipFile->getRealPath()) !== TRUE) {
            throw new ImportException(__('Unable to open ZIP file.'));
        }

        // Create extraction directory
        if (!File::exists($extractPath)) {
            File::makeDirectory($extractPath, 0755, true);
        }

        $zip->extractTo($extractPath);
        $zip->close();

        // Organize images by barcode
        $organizedImages = [];

        self::scanForImages($extractPath, $organizedImages);

        return $organizedImages;
    }

    private static function scanForImages($directory, &$organizedImages)
    {
        $items = scandir($directory);

        foreach ($items as $item) {
            if ($item == '.' || $item == '..') continue;

            $fullPath = $directory . '/' . $item;

            if (is_dir($fullPath)) {
                $potentialBarcode = basename($fullPath);

                // Check if this directory contains barcode subdirectories
                if (self::containsBarcodeDirectories($fullPath)) {
                    self::scanForBarcodeDirectories($fullPath, $organizedImages);
                }
                // Barcode validation: numeric and reasonable length
                elseif (preg_match('/^\d+$/', $potentialBarcode) && strlen($potentialBarcode) >= 3) {
                    self::processBarcodeDirectory($fullPath, $potentialBarcode, $organizedImages);
                } else {
                    // Recursively scan other directories
                    self::scanForImages($fullPath, $organizedImages);
                }
            }
        }
    }

    /**
     * Check if a directory contains barcode subdirectories
     */
    private static function containsBarcodeDirectories($directory)
    {
        $items = scandir($directory);
        
        foreach ($items as $item) {
            if ($item == '.' || $item == '..') continue;
            
            $fullPath = $directory . '/' . $item;
            
            if (is_dir($fullPath) && preg_match('/^\d+$/', $item) && strlen($item) >= 3) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Scan for barcode directories within a parent directory
     */
    private static function scanForBarcodeDirectories($directory, &$organizedImages)
    {
        $items = scandir($directory);

        foreach ($items as $item) {
            if ($item == '.' || $item == '..') continue;

            $fullPath = $directory . '/' . $item;

            if (is_dir($fullPath)) {
                $potentialBarcode = basename($fullPath);

                // Barcode validation: numeric and reasonable length
                if (preg_match('/^\d+$/', $potentialBarcode) && strlen($potentialBarcode) >= 3) {
                    self::processBarcodeDirectory($fullPath, $potentialBarcode, $organizedImages);
                } else {
                    // Recursively scan nested directories
                    self::scanForImages($fullPath, $organizedImages);
                }
            }
        }
    }

    private static function processBarcodeDirectory($directory, $barcode, &$organizedImages)
    {
        $images = [];
        $variantImages = [];
        $files = scandir($directory);

        foreach ($files as $file) {
            if ($file == '.' || $file == '..') continue;

            $filePath = $directory . '/' . $file;

            // Check for variants subdirectory
            if (is_dir($filePath) && $file === 'variants') {
                self::processVariantsDirectory($filePath, $barcode, $variantImages);
                continue;
            }

            if (is_file($filePath) && self::isImageFile($filePath)) {
                $arrangement = self::extractArrangementFromFilename($file);

                $images[] = [
                    'path' => $filePath,
                    'filename' => $file,
                    'arrangement' => $arrangement,
                ];
            }
        }

        // Sort by arrangement
        usort($images, fn($a, $b) => $a['arrangement'] <=> $b['arrangement']);

        if (!empty($images)) {
            $organizedImages[$barcode] = $images;
        }

        // Add variant images if found
        if (!empty($variantImages)) {
            if (!isset($organizedImages[$barcode])) {
                $organizedImages[$barcode] = [];
            }
            $organizedImages[$barcode]['variants'] = $variantImages;
        }
    }

    private static function processVariantsDirectory($variantsDir, $barcode, &$variantImages)
    {
        $skuDirs = scandir($variantsDir);

        foreach ($skuDirs as $skuDir) {
            if ($skuDir == '.' || $skuDir == '..') continue;

            $skuPath = $variantsDir . '/' . $skuDir;

            if (is_dir($skuPath)) {
                $sku = $skuDir;
                $images = [];
                $files = scandir($skuPath);

                foreach ($files as $file) {
                    if ($file == '.' || $file == '..') continue;

                    $filePath = $skuPath . '/' . $file;

                    if (is_file($filePath) && self::isImageFile($filePath)) {
                        $arrangement = self::extractArrangementFromFilename($file);

                        $images[] = [
                            'path' => $filePath,
                            'filename' => $file,
                            'arrangement' => $arrangement,
                        ];
                    }
                }

                // Sort by arrangement
                usort($images, fn($a, $b) => $a['arrangement'] <=> $b['arrangement']);

                if (!empty($images)) {
                    $variantImages[$sku] = $images;
                }
            }
        }
    }

    private static function isImageFile($filePath)
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

        return in_array($extension, $imageExtensions);
    }

    private static function extractArrangementFromFilename($filename)
    {
        // Extract number from filename (supports: 1.png, image_2.jpg, photo3.png, etc.)
        if (preg_match('/(\d+)(?=\.\w+$)/', $filename, $matches)) {
            return (int) $matches[1];
        }
        
        // If no number found, check for common patterns
        if (preg_match('/^(\d+)\./', $filename, $matches)) {
            return (int) $matches[1];
        }
        
        return 1; // Default arrangement
    }

    /**
     * Analyze ZIP contents for validation report
     */
    public static function analyzeZipContents($extractedImages)
    {
        $analysis = [
            'total_barcodes_found' => count($extractedImages),
            'barcodes_with_images' => [],
            'barcodes_without_images' => [],
            'invalid_barcode_folders' => [],
            'total_images_found' => 0,
            'zip_structure_errors' => [],
            'image_statistics' => []
        ];

        foreach ($extractedImages as $barcode => $data) {
            // Separate product images from variants
            $productImages = [];
            $variantImages = [];
            
            if (is_array($data)) {
                foreach ($data as $key => $value) {
                    if ($key === 'variants' && is_array($value)) {
                        $variantImages = $value;
                    } elseif (isset($value['filename'])) {
                        // This is a product image
                        $productImages[] = $value;
                    }
                }
            }
            
            $imageCount = count($productImages);
            $analysis['total_images_found'] += $imageCount;
            
            // Count variant images
            $variantImageCount = 0;
            foreach ($variantImages as $sku => $skuImages) {
                $variantImageCount += count($skuImages);
            }
            $analysis['total_images_found'] += $variantImageCount;
            
            $analysis['barcodes_with_images'][] = [
                'barcode' => $barcode,
                'image_count' => $imageCount,
                'variant_image_count' => $variantImageCount,
                'image_names' => array_column($productImages, 'filename')
            ];

            $analysis['image_statistics'][] = [
                'barcode' => $barcode,
                'total_images' => $imageCount,
                'total_variant_images' => $variantImageCount,
                'arrangements' => array_column($productImages, 'arrangement'),
                'file_types' => array_map(function($image) {
                    return pathinfo($image['filename'], PATHINFO_EXTENSION);
                }, $productImages)
            ];
        }

        return $analysis;
    }

    /**
     * Extract barcodes from Excel validation results
     */
    public static function extractBarcodesFromExcelValidation($excelResults)
    {
        $barcodes = [];
        
        // Get barcodes from valid rows
        if (isset($excelResults['valid_rows_data'])) {
            foreach ($excelResults['valid_rows_data'] as $row) {
                if (!empty($row['barcode'])) {
                    $barcodes[] = (string)$row['barcode'];
                }
            }
        }
        
        // Also get barcodes from error rows to show complete picture
        if (isset($excelResults['errors'])) {
            foreach ($excelResults['errors'] as $error) {
                if (!empty($error['barcode']) && $error['barcode'] !== 'N/A') {
                    $barcodes[] = (string)$error['barcode'];
                }
            }
        }

        // If no structured data, try to extract from raw data
        if (empty($barcodes) && isset($excelResults['validation_data'])) {
            foreach ($excelResults['validation_data'] as $data) {
                if (!empty($data['barcode']) && $data['barcode'] !== 'N/A') {
                    $barcodes[] = (string)$data['barcode'];
                }
            }
        }

        return array_unique($barcodes);
    }

    /**
     * Calculate overall validation status
     */
    public static function calculateOverallStatus($excelResults, $missingInZip)
    {
        $excelValid = isset($excelResults['valid_rows']) ? $excelResults['valid_rows'] : 0;
        $excelTotal = isset($excelResults['total_rows']) ? $excelResults['total_rows'] : 0;
        $missingImagesCount = count($missingInZip);

        if ($excelTotal === 0) {
            return 'invalid';
        }

        $excelSuccessRate = ($excelValid / $excelTotal) * 100;
        $imageCoverageRate = (($excelTotal - $missingImagesCount) / $excelTotal) * 100;

        if ($excelSuccessRate === 100 && $imageCoverageRate === 100) {
            return 'perfect';
        } elseif ($excelSuccessRate >= 80 && $imageCoverageRate >= 80) {
            return 'good';
        } elseif ($excelSuccessRate >= 50 && $imageCoverageRate >= 50) {
            return 'warning';
        } else {
            return 'error';
        }
    }

    /**
     * Combine Excel and ZIP validation results
     */
    public static function combineValidationResults($excelResults, $zipResults, $extractedImages)
    {
        // Extract barcodes from Excel data for comparison
        $excelBarcodes = self::extractBarcodesFromExcelValidation($excelResults);
        
        // Find missing barcodes (in Excel but not in ZIP)
        $missingInZip = array_diff($excelBarcodes, array_keys($extractedImages));
        
        // Find extra barcodes (in ZIP but not in Excel)
        $extraInZip = array_diff(array_keys($extractedImages), $excelBarcodes);

        return [
            'excel_validation' => $excelResults,
            'zip_validation' => $zipResults,
            'compatibility_analysis' => [
                'excel_barcodes_count' => count($excelBarcodes),
                'zip_barcodes_count' => count($extractedImages),
                'matching_barcodes' => array_values(array_intersect($excelBarcodes, array_keys($extractedImages))),
                'missing_in_zip' => array_values($missingInZip), // Barcodes in Excel but no images in ZIP
                'extra_in_zip' => array_values($extraInZip),    // Barcodes in ZIP but not in Excel
                'coverage_percentage' => $excelBarcodes ? count(array_intersect($excelBarcodes, array_keys($extractedImages))) / count($excelBarcodes) * 100 : 0
            ],
            'overall_status' => self::calculateOverallStatus($excelResults, $missingInZip)
        ];
    }
}