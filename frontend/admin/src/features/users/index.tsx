import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTranslation } from "react-i18next";
import { UserForm } from "./components/UserForm";
import { useUsersTableLogic } from "./hooks/useUsersTableLogic";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function Users() {
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
    setIsUserFormOpen,
    isUserFormOpen,
    editingUser,
    setEditingUser,
    handleSubmitUserForm,
    deleteDialogProps,
    toggleStatusDialogProps,
    userFormProps,
  } = useUsersTableLogic();

  // Inline all dialogs
  const Dialogs = (
    <>
      <ReusableDialog
        open={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? t("Update User") : t("Add User")}
        description={editingUser ? t("Update an existing user") : t("Add a new user")}
      >
        <UserForm
          onSubmit={handleSubmitUserForm}
          onCancel={() => setIsUserFormOpen(false)}
          roles={userFormProps.roles}
          permissions={userFormProps.permissions}
          isEdit={!!editingUser}
          initialData={editingUser || undefined}
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
        destructive={true}
      />
    </>
  );

  return (
    <Main>
      <GenericTable
        title={t("Users")}
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
        onAdd={() => setIsUserFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
