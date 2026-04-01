import { GenericTable } from "@/components/datatable/GenericTable";
import { PageForm } from "./components/PageForm";
import { usePagesTableLogic } from "./hooks/usePagesTableLogic";
import { useTranslation } from "react-i18next";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Pages() {
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
    setIsPageFormOpen,
    isPageFormOpen,
    editingPage,
    setEditingPage,
    handleSubmitPageForm,
  } = usePagesTableLogic();

  const Dialog = (
    <ReusableDialog
      open={isPageFormOpen}
      onClose={() => {
        setIsPageFormOpen(false);
        setEditingPage(null);
      }}
      title={editingPage ? t("Update Page") : t("Add Page")}
      description={editingPage ? t("Update an existing page") : t("Add a new page")}
      className="sm:max-w-5xl max-h-[90vh]"
    >
      <PageForm
        onSubmit={handleSubmitPageForm}
        onCancel={() => setIsPageFormOpen(false)}
        isEdit={!!editingPage}
        initialData={editingPage || undefined}
      />
    </ReusableDialog>
  );

  return (
      <GenericTable
        title={t("Pages")}
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
        DialogComponent={Dialog}
      />
  );
}
