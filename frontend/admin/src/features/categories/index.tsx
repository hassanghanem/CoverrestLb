import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTranslation } from "react-i18next";
import { CategoryForm } from "./components/CategoryForm";
import { useCategoriesTableLogic } from "./hooks/useCategoriesTableLogic";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Categories() {
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
    setIsCategoryFormOpen,
    isCategoryFormOpen,
    editingCategory,
    setEditingCategory,
    handleSubmitCategoryForm,
    deleteDialogProps,
    toggleStatusDialogProps,
    arrangements,
  } = useCategoriesTableLogic();

  const Dialogs = (
    <>
      <ReusableDialog
        open={isCategoryFormOpen}
        onClose={() => {
          setIsCategoryFormOpen(false);
          setEditingCategory(null);
        }}
        title={
          editingCategory
            ? t("Update Category")
            : t("Add Category")
        }
        description={
          editingCategory
            ? t("Update an existing category")
            : t("Add a new category")
        }
      >
        <CategoryForm
          onSubmit={handleSubmitCategoryForm}
          onCancel={() => setIsCategoryFormOpen(false)}
          isEdit={!!editingCategory}
          initialData={editingCategory || undefined}
          arrangements={arrangements}
        />
      </ReusableDialog>

      <DeleteDialog {...deleteDialogProps} />

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
    <Main>
      <GenericTable
        title={t("Categories")}
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
        onAdd={() => setIsCategoryFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
