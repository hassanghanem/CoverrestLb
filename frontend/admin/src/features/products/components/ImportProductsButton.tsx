
import { useState } from "react";
import { importProducts, downloadProductTemplate, validateProductImport } from "@/lib/services/Products-services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Download,
    Upload,
    Archive,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Eye,
    Loader2,
    Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ValidationResult, ImportResult } from "@/types/response.interfaces";
import { useTranslation } from "react-i18next";

export function ImportProductsButton({ onImported }: { onImported?: () => void }) {
    const { t } = useTranslation();
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [showValidationDetails, setShowValidationDetails] = useState(false);
    const [showImportDetails, setShowImportDetails] = useState(false);

    const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.endsWith('.zip')) {
                // Basic ZIP format check - backend will validate structure
                setZipFile(file);
                setValidationResult(null);
                setImportResult(null);
            } else {
                toast.error(t("Please select a valid ZIP file"));
                e.target.value = '';
            }
        }
    };

    const handleValidate = async () => {
        if (!zipFile) {
            toast.error(t("Please select a ZIP file to validate"));
            return;
        }

        setIsValidating(true);
        setValidationResult(null);
        const formData = new FormData();
        formData.append("zip_file", zipFile);

        try {
            const result = await validateProductImport(formData);
            setValidationResult(result);

            if (result.result && result.data) {
                const excelValidation = result.data.excel_validation;
                const imagesValidation = result.data.zip_validation;

                if (excelValidation) {
                    const { valid_rows, invalid_rows, total_rows } = excelValidation;

                    if (invalid_rows === 0) {
                        if (imagesValidation?.total_barcodes_found === imagesValidation?.barcodes_with_images?.length) {
                            toast.success(t("✓ Perfect! All {{total_rows}} rows are valid and all products have matching images.", { total_rows }));
                        } else if (imagesValidation?.total_barcodes_found) {
                            const withImages = imagesValidation.barcodes_with_images?.length || 0;
                            const total = imagesValidation.total_barcodes_found || 0;
                            toast.warning(t("✓ All {{total_rows}} rows are valid! However, {{withImages}}/{{total}} products have matching images.", { total_rows, withImages, total }));
                        } else {
                            toast.success(t("✓ All {{total_rows}} rows are valid!", { total_rows }));
                        }
                    } else {
                        toast.warning(t("⚠ Validation completed: {{valid_rows}} valid, {{invalid_rows}} invalid out of {{total_rows}} rows. Review errors below.", { valid_rows, invalid_rows, total_rows }));
                    }
                }
            } else {
                toast.error(result.message || t("Validation failed. Please check your ZIP file structure."));
            }
        } catch (error) {
            toast.error(t("Validation request failed. Please check your connection and try again."));
        } finally {
            setIsValidating(false);
        }
    };

    const handleImport = async () => {
        if (!zipFile) {
            toast.error(t("Please select a ZIP file to import"));
            return;
        }

        const hasValidationErrors = (validationResult?.data?.excel_validation?.invalid_rows ?? 0) > 0;

        if (hasValidationErrors) {
            const errorCount = validationResult?.data?.excel_validation?.invalid_rows;
            const shouldProceed = window.confirm(
                t("⚠ Issues Found:\n\n{{count}} rows contain validation errors\n\nRows with errors will be skipped during import.\n\nDo you want to proceed with importing the valid rows?", {
                    count: errorCount
                })
            );
            if (!shouldProceed) return;
        }

        setIsImporting(true);
        setImportResult(null);
        const formData = new FormData();
        formData.append("zip_file", zipFile);

        try {
            const result = await importProducts(formData);
            setImportResult(result);

            if (result.result && result.data) {
                const { successful, failed } = result.data;
                if (failed === 0) {
                    toast.success(t("✓ Success! All {{successful}} products imported successfully.", { successful }));
                } else if (successful > 0) {
                    toast.warning(t("⚠ Partial success: {{successful}} products imported, {{failed}} failed. Review errors below.", { successful, failed }));
                } else {
                    toast.error(t("✗ Import failed: All {{failed}} products failed to import. Review errors below.", { failed }));
                }

                if (successful > 0) {
                    onImported?.();
                }
            } else {
                toast.error(result.message || t("Import failed. Please check your ZIP file and try again."));
            }
        } catch (error) {
            toast.error(t("Import request failed. Please check your connection and try again."));
        } finally {
            setIsImporting(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setIsDownloading(true);
            await downloadProductTemplate();
        } catch (error) {

        } finally {
            setIsDownloading(false);
        }
    };

    const resetForm = () => {
        setZipFile(null);
        setValidationResult(null);
        setImportResult(null);
        setShowValidationDetails(false);
        setShowImportDetails(false);

        const zipInput = document.querySelector('input[type="file"][accept*="zip"]') as HTMLInputElement;
        if (zipInput) zipInput.value = '';
    };

    const getValidationStatus = () => {
        if (!validationResult?.data?.excel_validation) return null;

        const { valid_rows, total_rows } = validationResult.data.excel_validation;
        const percentage = (valid_rows / total_rows) * 100;

        if (percentage === 100) return "perfect";
        if (percentage >= 80) return "good";
        if (percentage >= 50) return "warning";
        return "error";
    };

    const getOverallStatus = () => {
        if (!validationResult?.data) return null;

        const excelValidation = validationResult.data.excel_validation;
        const zipValidation = validationResult.data.zip_validation;

        if (!excelValidation) return null;

        const hasExcelErrors = excelValidation.invalid_rows > 0;
        const hasMissingImages = (zipValidation?.total_barcodes_found ?? 0) > (zipValidation?.barcodes_with_images?.length ?? 0);

        if (!hasExcelErrors && !hasMissingImages) return "perfect";
        if (!hasExcelErrors && hasMissingImages) return "warning";
        if (hasExcelErrors) return "error";
        return "perfect";
    };

    const validationStatus = getValidationStatus();
    const overallStatus = getOverallStatus();

    const getExcelValidation = () => validationResult?.data?.excel_validation;
    const getZipValidation = () => validationResult?.data?.zip_validation;

    const excelValidation = getExcelValidation();
    const zipValidation = getZipValidation();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        {t("Bulk Product Import")}
                    </CardTitle>
                    <CardDescription>
                        {t("Import products using a ZIP file containing products.xlsx and product images.")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">1</Badge>
                            <div>
                                <strong>{t("Download Template")}</strong><br/>{t("Get the Excel template with Products and Variants sheets.")}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">2</Badge>
                            <div>
                                <strong>{t("Fill Excel")}</strong><br/>{t("Enter product info in Products sheet, add variants in Variants sheet (optional).")}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">3</Badge>
                            <div>
                                <strong>{t("Prepare Images")}</strong><br/>{t("Create 'images' folder with barcode subfolders containing numbered images (1.jpg, 2.jpg, etc.).")}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">4</Badge>
                            <div>
                                <strong>{t("Create ZIP")}</strong><br/>{t("Package products.xlsx and images/ folder into products_export.zip")}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">5</Badge>
                            <div>
                                <strong>{t("Validate")}</strong><br/>{t("Click 'Validate Data' to check for errors. Fix any issues found.")}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">6</Badge>
                            <div>
                                <strong>{t("Import")}</strong><br/>{t("Click 'Import Products' to upload. Matching barcodes will be updated, new barcodes will be created.")}
                            </div>
                        </div>
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="space-y-2">
                            <div><strong>{t("ZIP File Structure:")}</strong></div>
                            <div className="font-mono text-xs space-y-1">
                                <div>products_export.zip</div>
                                <div className="ml-4">├── products.xlsx</div>
                                <div className="ml-4">└── images/</div>
                                <div className="ml-8">├── 123456789/  (product barcode)</div>
                                <div className="ml-12">├── 1.jpg, 2.jpg  (product images)</div>
                                <div className="ml-12">└── variants/</div>
                                <div className="ml-16">└── SKU123/  (variant SKU)</div>
                                <div className="ml-20">├── 1.jpg, 2.jpg</div>
                                <div className="ml-8">└── 987654321/  (another product)</div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="space-y-2">
                            <div><strong>{t("Important Notes:")}</strong></div>
                            <div>• {t("ZIP must contain products.xlsx and images/ folder")}</div>
                            <div>• {t("Use existing barcodes to update products")}</div>
                            <div>• {t("Leave barcode empty to create new products")}</div>
                            <div>• {t("Max file size: 100MB")}</div>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("Select ZIP File")}</CardTitle>
                    <CardDescription>
                        {t("Choose a ZIP file containing products.xlsx and images/ folder")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            {t("Products ZIP File")} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept=".zip"
                                onChange={handleZipChange}
                                className="flex-1"
                                disabled={isImporting || isValidating}
                            />
                            {zipFile && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {zipFile.name}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("Required. Must contain products.xlsx and images/ folder. Max size: 100MB.")}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {validationResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{t("Validation Results")}</span>
                            <div className="flex gap-2">
                                <Badge variant={
                                    overallStatus === 'perfect' ? 'default' :
                                        overallStatus === 'warning' ? 'outline' : 'destructive'
                                }>
                                    {overallStatus === 'perfect' ? t('Ready to Import') :
                                        overallStatus === 'warning' ? t('Has Warnings') : t('Has Errors')}
                                </Badge>
                                {excelValidation && (
                                    <Badge variant={
                                        validationStatus === 'perfect' ? 'default' :
                                            validationStatus === 'good' ? 'secondary' :
                                                validationStatus === 'warning' ? 'outline' : 'destructive'
                                    }>
                                        {t("{{valid}}/{{total}} Valid", { valid: excelValidation.valid_rows, total: excelValidation.total_rows })}
                                    </Badge>
                                )}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {excelValidation && (
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t("Excel Data Validation")}</span>
                                    <span>{t("{{valid}}/{{total}} valid rows", { valid: excelValidation.valid_rows, total: excelValidation.total_rows })}</span>
                                </div>
                                <Progress
                                    value={((excelValidation.valid_rows || 0) / (excelValidation.total_rows || 1)) * 100}
                                    className={
                                        validationStatus === 'perfect' ? '' :
                                            validationStatus === 'good' ? '' :
                                                validationStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                                    }
                                />
                            </div>
                        )}

                        {zipFile && zipValidation && (
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{t("Images Validation")}</span>
                                    <span>{t("{{count}} barcodes found", { count: zipValidation.total_barcodes_found })}</span>
                                </div>
                                <Progress
                                    value={((zipValidation.barcodes_with_images?.length || 0) / (zipValidation.total_barcodes_found || 1)) * 100}
                                />
                                <div className="mt-2 text-xs text-muted-foreground">
                                    {t("{{count}} with images", { count: zipValidation.barcodes_with_images?.length || 0 })} •
                                    {t("{{count}} total images", { count: zipValidation.total_images_found || 0 })}
                                </div>

                                {(zipValidation.barcodes_with_images?.length ?? 0) < (zipValidation.total_barcodes_found ?? 0) && (
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>{t("Some Products Missing Images")}</strong>
                                            <div className="mt-1 text-sm">{t("{{withImages}}/{{total}} products have images", { withImages: zipValidation.barcodes_with_images?.length || 0, total: zipValidation.total_barcodes_found })}</div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {!zipFile && (
                            <Alert variant="default">
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>{t("No ZIP file provided.")}</strong> {t("Please select a ZIP file containing products.xlsx and images/ folder.")}
                                </AlertDescription>
                            </Alert>
                        )}

                        {(excelValidation?.errors && excelValidation.errors.length > 0) && (
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowValidationDetails(!showValidationDetails)}
                                    className="mb-2"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {showValidationDetails ? t('Hide') : t('Show')} {t('Validation Errors')} ({excelValidation.errors.length})
                                </Button>

                                {showValidationDetails && (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {excelValidation.errors.map((error, index) => (
                                            <Alert key={index} variant="destructive">
                                                <XCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>{t("Row {{row}} {{sheet}}", { row: error.row, sheet: error.sheet ? `(${error.sheet} sheet)` : '' })}:</strong> {t("Barcode")}: {error.barcode}<br />
                                                    <ul className="list-disc list-inside mt-1">
                                                        {error.errors.map((err, idx) => (
                                                            <li key={idx}>{err}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {(excelValidation?.warnings && excelValidation.warnings.length > 0) && (
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowValidationDetails(!showValidationDetails)}
                                    className="mb-2"
                                >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    {showValidationDetails ? t('Hide') : t('Show')} {t('Validation Warnings')} ({excelValidation.warnings.length})
                                </Button>

                                {showValidationDetails && (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {excelValidation.warnings.map((warning, index) => (
                                            <Alert key={index} variant="default">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>{t("Row {{row}} {{sheet}}", { row: warning.row, sheet: warning.sheet ? `(${warning.sheet} sheet)` : '' })}:</strong> {t("Barcode")}: {warning.barcode}<br />
                                                    <ul className="list-disc list-inside mt-1">
                                                        {warning.warnings.map((warn, idx) => (
                                                            <li key={idx}>{warn}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {importResult && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{t("Import Results")}</span>
                            <Badge variant={importResult.data?.failed === 0 ? 'default' : importResult.data?.successful === 0 ? 'destructive' : 'outline'}>
                                {t("{{successful}}/{{total}} Successful", {
                                    successful: importResult.data?.successful || 0,
                                    total: importResult.data?.total_processed || 0
                                })}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {importResult.data?.errors && importResult.data.errors.length > 0 && (
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowImportDetails(!showImportDetails)}
                                    className="mb-2"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {showImportDetails ? t('Hide') : t('Show')} {t('Failed Rows')} ({importResult.data.errors.length})
                                </Button>

                                {showImportDetails && (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {importResult.data.errors.map((error, index) => (
                                            <Alert key={index} variant="destructive">
                                                <XCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>{t("Row {{row}} {{sheet}}", { row: error.row, sheet: error.sheet ? `(${error.sheet} sheet)` : '' })}:</strong> {t("Barcode")}: {error.barcode}<br />
                                                    <ul className="list-disc list-inside mt-1">
                                                        {error.errors.map((err, idx) => (
                                                            <li key={idx}>{err}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {importResult.data?.successful && importResult.data.successful > 0 && (
                            <Alert variant="default" className="mt-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>{t("Successfully imported {{count}} product(s).", { count: importResult.data.successful })}</strong>
                                    {importResult.data.failed > 0 && t(" {{count}} product(s) failed to import.", { count: importResult.data.failed })}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2">
                    <Button
                        onClick={handleDownloadTemplate}
                        disabled={isDownloading}
                        variant="outline"
                    >
                        {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        {t("Download Template")}
                    </Button>

                    <Button
                        onClick={resetForm}
                        variant="outline"
                        disabled={isImporting || isValidating}
                    >
                        {t("Reset")}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleValidate}
                        disabled={!zipFile || isImporting || isValidating}
                        variant="secondary"
                    >
                        {isValidating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {t("Validate Data")}
                    </Button>

                    <Button
                        onClick={handleImport}
                        disabled={!zipFile || isImporting || !validationResult?.result || (validationResult?.data?.excel_validation?.invalid_rows ?? 0) > 0}
                    >
                        {isImporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {t("Import Products")}
                    </Button>
                </div>
            </div>
        </div>
    );
}