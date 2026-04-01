import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { AppDispatch } from "@/lib/store/store";
import { fetchSettings } from "@/lib/store/slices/settingsSlice";
import { updateUser, createUser, deleteUser } from "@/lib/services/Users-services";
import { toast } from "sonner";
import { User } from "@/types/api.interfaces";
import { useUsers } from "./useUsers";
import type { SortingState } from "@tanstack/react-table";
import { useUserColumns } from "./useUserColumns";
import { useSettings } from "@/hooks/usePublicData";

export function useUsersTableLogic() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const queryResult = useSettings();
    const roles = queryResult.data?.roles || [];
    const permissions = queryResult.data?.permissions || [];

    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserFormOpen(true);
    };

    const handleDeleteUserClick = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleToggleStatusClick = (user: User) => {
        setSelectedUser(user);
        setToggleStatusDialogOpen(true);
    };

    const handleConfirmDeleteUser = async () => {
        if (!selectedUser) return;
        setIsDeletingUser(true);
        try {
            await deleteUser(selectedUser.id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to delete user"));
        } finally {
            setIsDeletingUser(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const handleConfirmToggleStatus = async () => {
        if (!selectedUser) return;
        setIsTogglingStatus(true);
        try {
            await updateUser(selectedUser.id, {
                is_active: !selectedUser.is_active,
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to update user status"));
        } finally {
            setIsTogglingStatus(false);
            setToggleStatusDialogOpen(false);
            refetch();
        }
    };

    const handleSubmitUserForm = async (data: any) => {
        try {
            const response = editingUser
                ? await updateUser(editingUser.id, data)
                : await createUser(data);
            if (response.result) {
                setEditingUser(null);
                setIsUserFormOpen(false);
                refetch();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to save user"));
        }
    };

    const columns = useUserColumns({
        handleEdit: handleEditUser,
        handleDelete: handleDeleteUserClick,
        handleToggleActive: handleToggleStatusClick,
    });

    const { data, isLoading, isError, refetch } = useUsers({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const table = useReactTable({
        data: data?.users || [],
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
        setIsUserFormOpen,
        isUserFormOpen,
        editingUser,
        setEditingUser,
        handleSubmitUserForm,

        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmDeleteUser,
            loading: isDeletingUser,
            title: t("Delete user"),
            description: t("Are you sure you want to delete {{name}}? This action cannot be undone.", {
                name: selectedUser?.name || "",
            }),
        },

        toggleStatusDialogProps: {
            open: toggleStatusDialogOpen,
            onOpenChange: () => setToggleStatusDialogOpen(false),
            handleConfirm: handleConfirmToggleStatus,
            isLoading: isTogglingStatus,
            title: t("Change user status"),
            desc: selectedUser?.is_active
                ? t("Are you sure you want to deactivate this user?")
                : t("Are you sure you want to activate this user?"),
        },

        userFormProps: {
            roles,
            permissions,
        },
    };
}