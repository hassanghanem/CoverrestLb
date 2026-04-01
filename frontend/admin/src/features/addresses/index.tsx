import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { AddressForm } from "./components/AddressForm";
import { useTranslation } from "react-i18next";
import { useAddressesTableLogic } from "./hooks/useAddressesTableLogic";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Addresses() {
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
    setIsAddressFormOpen,
    isAddressFormOpen,
    editingAddress,
    setEditingAddress,
    handleSubmitAddressForm,
    deleteDialogProps,
    toggleStatusDialogProps,
    toggleDefaultDialogProps,
  } = useAddressesTableLogic();

  const Dialogs = (
    <>
      <ReusableDialog
        open={isAddressFormOpen}
        onClose={() => {
          setIsAddressFormOpen(false);
          setEditingAddress(null);
        }}
        title={
          editingAddress ? t("Update Address") : t("Add Address")
        }
        description={
          editingAddress
            ? t("Update an existing address")
            : t("Add a new address")
        }
      >
        <AddressForm
          onSubmit={handleSubmitAddressForm}
          onCancel={() => setIsAddressFormOpen(false)}
          isEdit={!!editingAddress}
          initialData={editingAddress || undefined}
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

      <ConfirmDialog
        open={toggleDefaultDialogProps.open}
        onOpenChange={toggleDefaultDialogProps.onOpenChange}
        handleConfirm={toggleDefaultDialogProps.handleConfirm}
        isLoading={toggleDefaultDialogProps.isLoading}
        title={toggleDefaultDialogProps.title}
        desc={toggleDefaultDialogProps.desc}
        cancelBtnText={t("Cancel")}
        confirmText={t("Confirm")}
        destructive={false}
      />
    </>
  );

  return (
    <Main>
      <GenericTable
        title={t("Addresses")}
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
        onAdd={() => setIsAddressFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
