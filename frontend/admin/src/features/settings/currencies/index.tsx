import { GenericTable } from "@/components/datatable/GenericTable";
import { CurrencyForm } from "./components/CurrencyForm";
import { useCurrenciesTableLogic } from "./hooks/useCurrenciesTableLogic";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Currencies() {
  const { t } = useTranslation();
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
    setIsCurrencyFormOpen,
    isCurrencyFormOpen,
    editingCurrency,
    setEditingCurrency,
    handleSubmitCurrencyForm,
    deleteDialogProps,
    toggleDefaultDialogProps,
  } = useCurrenciesTableLogic();

  const Dialogs = (
    <>
      <ReusableDialog
        open={isCurrencyFormOpen}
        onClose={() => {
          setIsCurrencyFormOpen(false);
          setEditingCurrency(null);
        }}
        title={editingCurrency ? t("Update Currency") : t("Add Currency")}
        description={
          editingCurrency
            ? t("Update an existing currency")
            : t("Add a new currency")
        }
      >
        <CurrencyForm
          onSubmit={handleSubmitCurrencyForm}
          onCancel={() => setIsCurrencyFormOpen(false)}
          isEdit={!!editingCurrency}
          initialData={editingCurrency || undefined}
        />
      </ReusableDialog>

      <DeleteDialog {...deleteDialogProps} />

      <ConfirmDialog
        open={toggleDefaultDialogProps.open}
        onOpenChange={toggleDefaultDialogProps.onOpenChange}
        handleConfirm={toggleDefaultDialogProps.handleConfirm}
        isLoading={toggleDefaultDialogProps.isLoading}
        title={toggleDefaultDialogProps.title}
        desc={toggleDefaultDialogProps.desc}
        cancelBtnText={t("Cancel")}
        confirmText={t("Confirm")}
        destructive={false}
      />
    </>
  );

  return (
      <GenericTable
        title={t("Currencies")}
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
        onAdd={() => setIsCurrencyFormOpen(true)}
        DialogComponent={Dialogs}
      />
  );
}
