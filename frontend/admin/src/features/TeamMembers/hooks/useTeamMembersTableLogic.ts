import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { updateTeamMember, createTeamMember, deleteTeamMember } from "@/lib/services/TeamMembers-services";
import { toast } from "sonner";
import { TeamMember } from "@/types/api.interfaces";
import type { SortingState } from "@tanstack/react-table";
import { useTeamMemberColumns } from "./useTeamMemberColumns";
import { useTeamMembers } from "./useTeamMembers";
import { TeamMemberFormValues } from "@/types/form.interfaces";

export function useTeamMembersTableLogic() {
    const { t } = useTranslation();

    const [isTeamMemberFormOpen, setIsTeamMemberFormOpen] = useState(false);
    const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
    const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletingTeamMember, setIsDeletingTeamMember] = useState(false);

    const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const handleEditTeamMember = (TeamMember: TeamMember) => {
        setEditingTeamMember(TeamMember);
        setIsTeamMemberFormOpen(true);
    };

    const handleDeleteTeamMemberClick = (TeamMember: TeamMember) => {
        setSelectedTeamMember(TeamMember);
        setDeleteDialogOpen(true);
    };

    const handleToggleStatusClick = (TeamMember: TeamMember) => {
        setSelectedTeamMember(TeamMember);
        setToggleStatusDialogOpen(true);
    };

    const handleConfirmDeleteTeamMember = async () => {
        if (!selectedTeamMember) return;
        setIsDeletingTeamMember(true);
        try {
            await deleteTeamMember(selectedTeamMember.id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to delete team member"));
        } finally {
            setIsDeletingTeamMember(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const handleConfirmToggleStatus = async () => {
        if (!selectedTeamMember) {
            return;
        }

        setIsTogglingStatus(true);

        try {
            const newStatus = !selectedTeamMember.is_active;

            const formData = new FormData();
            formData.append('is_active', newStatus ? '1' : '0');
            Object.entries(selectedTeamMember.name).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, value);
            });
            Object.entries(selectedTeamMember.occupation).forEach(([lang, value]) => {
                formData.append(`occupation[${lang}]`, value);
            });

            formData.append('arrangement', selectedTeamMember.arrangement.toString());

            await updateTeamMember(selectedTeamMember.id, formData);

        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to update team member status"));
        } finally {
            setIsTogglingStatus(false);
            setToggleStatusDialogOpen(false);
            refetch();
        }
    };

    const handleSubmitTeamMemberForm = async (data: TeamMemberFormValues) => {
        try {
            const formData = new FormData();
            Object.entries(data.name).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, value);
            });
            Object.entries(data.occupation).forEach(([lang, value]) => {
                formData.append(`occupation[${lang}]`, value);
            });

            if (data.arrangement) {
                formData.append('arrangement', data.arrangement);
            }

            if (!editingTeamMember) {
                if (data.image instanceof File) {
                    formData.append('image', data.image);
                } else {
                    throw new Error(t("Image is required"));
                }
            } else {
                if (data.image instanceof File) {
                    formData.append('image', data.image);
                }
            }

            const response = editingTeamMember
                ? await updateTeamMember(editingTeamMember.id, formData)
                : await createTeamMember(formData);

            if (response.result) {
                setEditingTeamMember(null);
                setIsTeamMemberFormOpen(false);
                refetch();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Unexpected error occurred"));
        }
    };

    const columns = useTeamMemberColumns({
        handleEdit: handleEditTeamMember,
        handleDelete: handleDeleteTeamMemberClick,
        handleToggleActive: handleToggleStatusClick,
    });

    const { data, isLoading, isError, refetch } = useTeamMembers({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });
    const arrangements = Array.isArray(data?.team_members)
        ? data.team_members.map((TeamMember: TeamMember) => TeamMember.arrangement)
        : [];

    const table = useReactTable({
        data: data?.team_members || [],
        columns,
        pageCount: data?.pagination?.last_page || -1,
        state: { sorting, pagination, globalFilter: appliedSearch },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualFiltering: true,
        manualSorting: true,
    });

    const handleSearch = () => {
        setAppliedSearch(searchInput);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const handleRefresh = () => refetch();

    return {
        messages: t,
        table,
        columns,
        data,
        isLoading,
        isError,
        appliedSearch,
        pagination,
        handleSearch,
        handleRefresh,
        setSearchInput,
        searchInput,
        setIsTeamMemberFormOpen,
        isTeamMemberFormOpen,
        editingTeamMember,
        setEditingTeamMember,
        handleSubmitTeamMemberForm,

        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmDeleteTeamMember,
            loading: isDeletingTeamMember,
            title: t("Delete Team Member"),
            description: t("Are you sure you want to delete this team member? This action cannot be undone."),
        },

        toggleStatusDialogProps: {
            open: toggleStatusDialogOpen,
            onOpenChange: () => setToggleStatusDialogOpen(false),
            handleConfirm: handleConfirmToggleStatus,
            isLoading: isTogglingStatus,
            title: t("Change Team Member Status"),
            desc: selectedTeamMember?.is_active
                ? t("Are you sure you want to deactivate this team member?")
                : t("Are you sure you want to activate this team member?"),
        },
        arrangements
    };
}