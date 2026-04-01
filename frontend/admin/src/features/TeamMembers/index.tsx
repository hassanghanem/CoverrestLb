import { Main } from "@/components/layout/main";
import { GenericTable } from "@/components/datatable/GenericTable";
import { useTeamMembersTableLogic } from "./hooks/useTeamMembersTableLogic";
import { TeamMemberForm } from "./components/TeamMemberForm";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/components/public/confirm-dialog";
import { DeleteDialog } from "@/components/public/DeleteDialog";
import { ReusableDialog } from "@/components/public/reusable-dialog";

export default function TeamMembers() {
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
    setIsTeamMemberFormOpen,
    isTeamMemberFormOpen,
    editingTeamMember,
    setEditingTeamMember,
    handleSubmitTeamMemberForm,
    deleteDialogProps,
    toggleStatusDialogProps,
    arrangements,
  } = useTeamMembersTableLogic();

  // Inline dialogs
  const Dialogs = (
    <>
      {/* Add/Edit Team Member */}
      <ReusableDialog
        open={isTeamMemberFormOpen}
        onClose={() => {
          setIsTeamMemberFormOpen(false);
          setEditingTeamMember(null);
        }}
        title={
          editingTeamMember
            ? t("Update Team Member")
            : t("Add Team Member")
        }
        description={
          editingTeamMember
            ? t("Update an existing team member")
            : t("Add a new team member")
        }
      >
        <TeamMemberForm
          onSubmit={handleSubmitTeamMemberForm}
          onCancel={() => setIsTeamMemberFormOpen(false)}
          isEdit={!!editingTeamMember}
          initialData={editingTeamMember || undefined}
          arrangements={arrangements}
        />
      </ReusableDialog>

      {/* Delete Team Member */}
      <DeleteDialog {...deleteDialogProps} />

      {/* Toggle Status / Confirm */}
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
        title={t("Team Members")}
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
        onAdd={() => setIsTeamMemberFormOpen(true)}
        DialogComponent={Dialogs}
      />
    </Main>
  );
}
