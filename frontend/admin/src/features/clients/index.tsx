import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTranslation } from "react-i18next";
import { ClientForm } from "./components/ClientForm";
import { useClientsTableLogic } from "./hooks/useClientsTableLogic";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Clients() {
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
    setIsClientFormOpen,
    isClientFormOpen,
    editingClient,
    setEditingClient,
    handleSubmitClientForm,
    deleteDialogProps,
    toggleStatusDialogProps,
  } = useClientsTableLogic();

  // Inline dialogs as a single component
  const Dialogs = (
    <>
      {/* Add/Edit Client Dialog */}
      <ReusableDialog
        open={isClientFormOpen}
        onClose={() => {
          setIsClientFormOpen(false);
          setEditingClient(null);
        }}
        title={editingClient ? t("Update Client") : t("Add Client")}
        description={
          editingClient
            ? t("Update an existing client")
            : t("Add a new client")
        }
      >
        <ClientForm
          onSubmit={handleSubmitClientForm}
          onCancel={() => setIsClientFormOpen(false)}
          isEdit={!!editingClient}
          initialData={editingClient || undefined}
        />
      </ReusableDialog>

      {/* Delete Client Dialog */}
      <DeleteDialog {...deleteDialogProps} />

      {/* Toggle Status / Confirm Dialog */}
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
        title={t("Clients")}
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
        onAdd={() => setIsClientFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
