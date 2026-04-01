import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTranslation } from "react-i18next";
import { useReviewsTableLogic } from "./hooks/useReviewsTableLogic";
import { ConfirmDialog } from "@/components/public/confirm-dialog";

export default function Reviews() {
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
    toggleStatusDialogProps,
  } = useReviewsTableLogic();

  // Inline Confirm Dialog for review status changes
  const Dialogs = (
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
  );

  return (
    <Main>
      <GenericTable
        title={t("Reviews")}
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
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
