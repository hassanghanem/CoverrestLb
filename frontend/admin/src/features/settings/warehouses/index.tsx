import { GenericTable } from "@/components/datatable/GenericTable";
import { useWarehousesTableLogic } from "./hooks/useWarehousesTableLogic";
import { WarehouseForm } from "./components/WarehouseForm";
import { useTranslation } from "react-i18next";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Warehouses() {
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
    setIsWarehouseFormOpen,
    isWarehouseFormOpen,
    editingWarehouse,
    setEditingWarehouse,
    handleSubmitWarehouseForm,
    deleteDialogProps,
  } = useWarehousesTableLogic();

  const Dialogs = (
    <>
      <ReusableDialog
        open={isWarehouseFormOpen}
        onClose={() => {
          setIsWarehouseFormOpen(false);
          setEditingWarehouse(null);
        }}
        title={editingWarehouse ? t("Update Warehouse") : t("Add Warehouse")}
        description={editingWarehouse ? t("Update an existing warehouse") : t("Add a new warehouse")}
      >
        <WarehouseForm
          onSubmit={handleSubmitWarehouseForm}
          onCancel={() => setIsWarehouseFormOpen(false)}
          isEdit={!!editingWarehouse}
          initialData={editingWarehouse || undefined}
        />
      </ReusableDialog>

      <DeleteDialog {...deleteDialogProps} />
    </>
  );

  return (
    <GenericTable
      title={t("Warehouses")}
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
      onAdd={() => setIsWarehouseFormOpen(true)}
      DialogComponent={Dialogs}
    />
  );
}
