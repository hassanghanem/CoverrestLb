import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTranslation } from "react-i18next";
import { OrderForm } from "./components/OrderForm";
import { useOrdersTableLogic } from "./hooks/useOrdersTableLogic";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Orders() {
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
    setIsOrderFormOpen,
    isOrderFormOpen,
    handleSubmitOrderForm,
    useAllClientsData,
    useAllVariantsData,
    useAllAddressesData,
  } = useOrdersTableLogic();

  const Dialogs = (
    <ReusableDialog
      open={isOrderFormOpen}
      onClose={() => setIsOrderFormOpen(false)}
      title={t("Create order")}
      description={t("Fill in the details to create a new order")}
    >
      <OrderForm
        onSubmit={handleSubmitOrderForm}
        onCancel={() => setIsOrderFormOpen(false)}
        useAllClientsData={useAllClientsData}
        useAllAddressesData={useAllAddressesData}
        useAllVariantsData={useAllVariantsData}
      />
    </ReusableDialog>
  );

  return (
    <Main>
      <GenericTable
        title={t("Orders")}
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
        onAdd={() => setIsOrderFormOpen(true)}
        DialogComponent={Dialogs}
        addButtonLabel={t("Create order")}
      />
    </Main>
  );
}