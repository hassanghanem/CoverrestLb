import { GenericTable } from "@/components/datatable/GenericTable";
import { useBrandsTableLogic } from "./hooks/useBrandsTableLogic";
import { BrandForm } from "./components/BrandForm";
import { useTranslation } from "react-i18next";
import { ReusableDialog } from "@/components/public/reusable-dialog";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";

export default function Brands() {
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
    setIsBrandFormOpen,
    isBrandFormOpen,
    editingBrand,
    setEditingBrand,
    handleSubmitBrandForm,
    deleteDialogProps,
    toggleStatusDialogProps,
  } = useBrandsTableLogic();

  const Dialogs = (
    <>
      {/* Add/Edit Brand */}
      <ReusableDialog
        open={isBrandFormOpen}
        onClose={() => {
          setIsBrandFormOpen(false);
          setEditingBrand(null);
        }}
        title={editingBrand ? t("Update Brand") : t("Add Brand")}
        description={
          editingBrand
            ? t("Update an existing brand")
            : t("Add a new brand")
        }
      >
        <BrandForm
          onSubmit={handleSubmitBrandForm}
          onCancel={() => setIsBrandFormOpen(false)}
          isEdit={!!editingBrand}
          initialData={editingBrand || undefined}
        />
      </ReusableDialog>

      {/* Delete Brand */}
      <DeleteDialog {...deleteDialogProps} />

      {/* Confirm/Toggle Status */}
      <ConfirmDialog
        open={toggleStatusDialogProps.open}
        onOpenChange={toggleStatusDialogProps.onOpenChange}
        handleConfirm={toggleStatusDialogProps.handleConfirm}
        isLoading={toggleStatusDialogProps.isLoading}
        title={toggleStatusDialogProps.title}
        desc={toggleStatusDialogProps.desc}
        cancelBtnText={t("Cancel")}
        confirmText={t("Confirm")}
        destructive={false}
      />
    </>
  );

  return (
    <GenericTable
      title={t("Brands")}
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
      onAdd={() => setIsBrandFormOpen(true)}
      DialogComponent={Dialogs}
    />
  );
}
