import { GenericTable } from "@/components/datatable/GenericTable";
import { useTagsTableLogic } from "./hooks/useTagsTableLogic";
import { TagForm } from "./components/TagForm";
import { useTranslation } from "react-i18next";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Tags() {
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
    setIsTagFormOpen,
    isTagFormOpen,
    editingTag,
    setEditingTag,
    handleSubmitTagForm,
    deleteDialogProps,
  } = useTagsTableLogic();

  const Dialogs = (
    <>
      <ReusableDialog
        open={isTagFormOpen}
        onClose={() => {
          setIsTagFormOpen(false);
          setEditingTag(null);
        }}
        title={editingTag ? t("Update Tag") : t("Add Tag")}
        description={editingTag ? t("Update an existing tag") : t("Add a new tag")}
      >
        <TagForm
          onSubmit={handleSubmitTagForm}
          onCancel={() => setIsTagFormOpen(false)}
          isEdit={!!editingTag}
          initialData={editingTag || undefined}
        />
      </ReusableDialog>

      <DeleteDialog {...deleteDialogProps} />
    </>
  );

  return (
      <GenericTable
        title={t("Tags")}
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
        onAdd={() => setIsTagFormOpen(true)}
        DialogComponent={Dialogs}
      />
  );
}
