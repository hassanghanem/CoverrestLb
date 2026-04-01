import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { usePreOrdersTableLogic } from "./hooks/usePreOrdersTableLogic";
import { PreOrderForm } from "./components/PreOrderForm";
import { useTranslation } from "react-i18next";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function PreOrders() {
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
    setIsPreOrderFormOpen,
    isPreOrderFormOpen,
    handleSubmitPreOrderForm,
    useAllClientsData,
    useAllVariantsData,
    useAllAddressesData,
  } = usePreOrdersTableLogic();

  const Dialogs = (
    <ReusableDialog
      open={isPreOrderFormOpen}
      onClose={() => setIsPreOrderFormOpen(false)}
      title={t("Create pre-order")}
      description={t("Fill in the details to create a new pre-order")}
    >
      <PreOrderForm
        onSubmit={handleSubmitPreOrderForm}
        onCancel={() => setIsPreOrderFormOpen(false)}
        useAllClientsData={useAllClientsData}
        useAllAddressesData={useAllAddressesData}
        useAllVariantsData={useAllVariantsData}
      />
    </ReusableDialog>
  );

  return (
    <Main>
      <GenericTable
        title={t("Pre-orders")}
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
        onAdd={() => setIsPreOrderFormOpen(true)}
        DialogComponent={Dialogs}
        addButtonLabel={t("Create pre-order")}
      />
    </Main>
  );
}