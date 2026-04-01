import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useStockAdjustmentsTableLogic } from "./hooks/useStockAdjustmentsTableLogic";
import { StockAdjustmentForm } from "./components/StockAdjustmentForm";
import { useTranslation } from "react-i18next";
import { ReusableDialog } from "@/components/public/reusable-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";

export default function StockAdjustments() {
  const { t } = useTranslation();
  const {
    table,
    columns,
    data,
    isLoading,
    isError,
    searchInput,
    setSearchInput,
    handleSearch,
    handleRefresh,
    setIsStockAdjustmentFormOpen,
    isStockAdjustmentFormOpen,
    handleSubmitStockAdjustmentForm,
    warehouses,
    useProductVariantData,
    missingItems,
    deleteDialogProps,
  } = useStockAdjustmentsTableLogic();

  // Inline dialog for adding stock adjustment
  const Dialogs = (
    <>
      <DeleteDialog {...deleteDialogProps} />
      <ReusableDialog
        open={isStockAdjustmentFormOpen}
        onClose={() => setIsStockAdjustmentFormOpen(false)}
        title={t("Add Stock Adjustment")}
        description={t("Fill out the form to add a new stock adjustment")}
      >
        <StockAdjustmentForm
          onSubmit={handleSubmitStockAdjustmentForm}
          onCancel={() => setIsStockAdjustmentFormOpen(false)}
          warehouses={warehouses || []}
          useProductVariantData={useProductVariantData}
        />
      </ReusableDialog>
    </>
  );

  if (missingItems.length > 0) {
    return (
      <div className="text-red-500 space-y-1 bg-red-50 border border-red-300 p-4 rounded-md">
        <p className="font-semibold">{t("Missing required data")}</p>
        <ul className="list-disc list-inside">
          {missingItems.map((msg: string, i: number) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Main>
      <GenericTable
        title={t("Stock Adjustments")}
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
        onAdd={() => setIsStockAdjustmentFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
