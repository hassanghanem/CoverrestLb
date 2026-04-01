import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useReturnOrdersTableLogic } from "./hooks/useReturnOrdersTableLogic";
import { ReturnOrderForm } from "./components/ReturnOrderForm";
import { useTranslation } from "react-i18next";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function ReturnOrders() {
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
    setIsReturnOrderFormOpen,
    isReturnOrderFormOpen,
    handleSubmitReturnOrderForm,
    useAllOrdersData,
  } = useReturnOrdersTableLogic();

  // Inline the Add Return Order dialog
  const Dialogs = (
    <ReusableDialog
      open={isReturnOrderFormOpen}
      onClose={() => setIsReturnOrderFormOpen(false)}
      title={t("Add return order")}
      description={t("Add a new return order to the system")}
    >
      <ReturnOrderForm
        onSubmit={handleSubmitReturnOrderForm}
        onCancel={() => setIsReturnOrderFormOpen(false)}
        useAllOrdersData={useAllOrdersData}
      />
    </ReusableDialog>
  );

  return (
    <Main>
      <GenericTable
        title={t("Return Orders")}
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
        onAdd={() => setIsReturnOrderFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
