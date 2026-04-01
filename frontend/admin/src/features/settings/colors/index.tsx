import { GenericTable } from "@/components/datatable/GenericTable";
import { ColorForm } from "./components/ColorForm";
import { useColorsTableLogic } from "./hooks/useColorsTableLogic";
import { useTranslation } from "react-i18next";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Colors() {
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
    setIsColorFormOpen,
    isColorFormOpen,
    editingColor,
    setEditingColor,
    handleSubmitColorForm,
    deleteDialogProps,
  } = useColorsTableLogic();

  const Dialogs = (
    <>
      <ReusableDialog
        open={isColorFormOpen}
        onClose={() => {
          setIsColorFormOpen(false);
          setEditingColor(null);
        }}
        title={t(editingColor ? "Update Color" : "Add Color")}
        description={t(
          editingColor
            ? "Update an existing color"
            : "Add a new color"
        )}
      >
        <ColorForm
          onSubmit={handleSubmitColorForm}
          onCancel={() => setIsColorFormOpen(false)}
          isEdit={!!editingColor}
          initialData={editingColor || undefined}
        />
      </ReusableDialog>

      <DeleteDialog {...deleteDialogProps} />
    </>
  );

  return (
    <GenericTable
      title={t("Colors")}
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
      onAdd={() => setIsColorFormOpen(true)}
      DialogComponent={Dialogs}
    />
  );
}
