import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useHomeSectionsTableLogic } from "./hooks/useHomeSectionsTableLogic";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";

export default function HomeSections() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    toggleStatusDialogProps,
  } = useHomeSectionsTableLogic();

  const Dialogs = (
    <>
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
        title={t("Home Sections")}
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
        onAdd={() => navigate("/home-sections/new")}
        addButtonLabel={t("Add Home Section")}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
