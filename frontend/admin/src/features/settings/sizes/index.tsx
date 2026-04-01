import { GenericTable } from "@/components/datatable/GenericTable";
import { SizeForm } from "./components/SizeForm";
import { useSizesTableLogic } from "./hooks/useSizesTableLogic";
import { useTranslation } from "react-i18next";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Sizes() {
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
    setIsSizeFormOpen,
    isSizeFormOpen,
    editingSize,
    setEditingSize,
    handleSubmitSizeForm,
    deleteDialogProps,
  } = useSizesTableLogic();

  const Dialogs = (
    <>
      <ReusableDialog
        open={isSizeFormOpen}
        onClose={() => {
          setIsSizeFormOpen(false);
          setEditingSize(null);
        }}
        title={t(editingSize ? "Update Size" : "Add Size")}
        description={t(
          editingSize
            ? "Update an existing Size"
            : "Add a new Size"
        )}
      >
        <SizeForm
          onSubmit={handleSubmitSizeForm}
          onCancel={() => setIsSizeFormOpen(false)}
          isEdit={!!editingSize}
          initialData={editingSize || undefined}
        />
      </ReusableDialog>

      <DeleteDialog {...deleteDialogProps} />
    </>
  );

  return (
    <GenericTable
      title={t("Sizes")}
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
      onAdd={() => setIsSizeFormOpen(true)}
      DialogComponent={Dialogs}
    />
  );
}
