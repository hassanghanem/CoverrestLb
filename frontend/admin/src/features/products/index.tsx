import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useProductsTableLogic } from "./hooks/useProductsTableLogic";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImportProductsButton } from "./components/ImportProductsButton";
import { exportSelectedProducts, openBulkBarcodesPrint } from "@/lib/services/Products-services";
import { BulkUpdateDialog } from "./components/BulkUpdateDialog";
import { ProductFilters } from "./components/ProductFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    table,
    columns,
    data,
    isLoading,
    isError,
    handleSearch,
    handleRefresh,
    setSearchInput,
    searchInput,
    deleteDialogProps,
    selectedProductIds,
    filters,
    handleFilterChange,
    handleClearFilters,
    sorting,
    setSorting,
  } = useProductsTableLogic();

  const handleImported = () => {
    setImportDialogOpen(false);
    handleRefresh();
  };

  const handleExportSelected = async () => {
    if (!selectedProductIds.length || isExporting) return;

    try {
      setIsExporting(true);
      await exportSelectedProducts(selectedProductIds);
    } catch (error) {
      // Errors are handled with toasts inside the helper
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkUpdateSuccess = () => {
    handleRefresh();
  };

  const handlePrintSelectedBarcodes = async () => {
    if (!selectedProductIds.length) return;
    await openBulkBarcodesPrint({ productIds: selectedProductIds });
  };

  return (
    <Main>
      {/* Delete Dialog */}
      <DeleteDialog {...deleteDialogProps} />

      {/* Bulk Update Dialog */}
      <BulkUpdateDialog
        open={bulkUpdateDialogOpen}
        onOpenChange={setBulkUpdateDialogOpen}
        selectedProductIds={selectedProductIds}
        onSuccess={handleBulkUpdateSuccess}
      />

      <GenericTable
        title={t("Products")}
        table={table}
        columns={columns}
        data={data}
        isLoading={isLoading}
        isError={isError}
        messages={t}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        onAdd={() => navigate("/products/new")}
        addButtonLabel={t("Add Product")}
        additionalButtons={
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:items-center">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            <Select
              value={sorting.length ? `${sorting[0].id}-${sorting[0].desc ? "desc" : "asc"}` : ""}
              onValueChange={(val: string) => {
                if (!val) {
                  setSorting([]);
                  return;
                }
                const [id, order] = val.split("-");
                setSorting([{ id, desc: order === "desc" }]);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t("Sort By")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">{t("Name")} (A-Z)</SelectItem>
                <SelectItem value="name-desc">{t("Name")} (Z-A)</SelectItem>
                <SelectItem value="price-asc">{t("Price")} ({t("Low to High")})</SelectItem>
                <SelectItem value="price-desc">{t("Price")} ({t("High to Low")})</SelectItem>
                <SelectItem value="category.name-asc">{t("Category")} (A-Z)</SelectItem>
                <SelectItem value="category.name-desc">{t("Category")} (Z-A)</SelectItem>
                <SelectItem value="brand.name-asc">{t("Brand")} (A-Z)</SelectItem>
                <SelectItem value="brand.name-desc">{t("Brand")} (Z-A)</SelectItem>
                <SelectItem value="created_at-desc">{t("Newest First")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile: compact dropdown */}
            <div className="sm:hidden w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full" variant="outline">
                    {t("Actions")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    disabled={!selectedProductIds.length || isExporting}
                    onSelect={() => setBulkUpdateDialogOpen(true)}
                  >
                    {t("Bulk Update")} ({selectedProductIds.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!selectedProductIds.length || isExporting}
                    onSelect={handleExportSelected}
                  >
                    {t("Export Selected")} ({selectedProductIds.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!selectedProductIds.length}
                    onSelect={handlePrintSelectedBarcodes}
                  >
                    {t("Print Barcodes")} ({selectedProductIds.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setImportDialogOpen(true)}>
                    {t("Import Products")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: inline buttons */}
            <div className="hidden sm:flex flex-row flex-wrap gap-2 justify-end items-center w-full">
              <Button
                className="w-full sm:w-auto min-w-[150px]"
                variant="default"
                disabled={!selectedProductIds.length || isExporting}
                onClick={() => setBulkUpdateDialogOpen(true)}
              >
                {t("Bulk Update")} ({selectedProductIds.length})
              </Button>

              <Button
                className="w-full sm:w-auto min-w-[170px]"
                variant="outline"
                onClick={handleExportSelected}
                disabled={!selectedProductIds.length || isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {t("Export Selected")} ({selectedProductIds.length})
              </Button>

              <Button
                className="w-full sm:w-auto min-w-[170px]"
                variant="outline"
                onClick={handlePrintSelectedBarcodes}
                disabled={!selectedProductIds.length}
              >
                {t("Print Barcodes")} ({selectedProductIds.length})
              </Button>

              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto min-w-[170px]" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    {t("Import Products")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="overflow-y-auto sm:max-w-5xl max-h-[90vh] ">
                  <DialogHeader>
                    <DialogTitle>{t("Bulk Product Import")}</DialogTitle>
                    <DialogDescription>
                      {t("Import multiple products using the Excel template (Products & Variants sheets). Optionally include a ZIP file with product images.")}
                    </DialogDescription>
                  </DialogHeader>
                  <ImportProductsButton onImported={handleImported} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />
    </Main>
  );
}