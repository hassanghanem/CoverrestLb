import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { AppDispatch } from "@/lib/store/store";
import { fetchSettings } from "@/lib/store/slices/settingsSlice";
import { updateClient, createClient, deleteClient } from "@/lib/services/Clients-services";
import { toast } from "sonner";
import { Client } from "@/types/api.interfaces";
import { useClients } from "./useClients";
import type { SortingState } from "@tanstack/react-table";
import { useClientColumns } from "./useClientColumns";

export function useClientsTableLogic() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [isClientFormOpen, setIsClientFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletingClient, setIsDeletingClient] = useState(false);

    const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const handleEditClient = (client: Client) => {
        setEditingClient(client);
        setIsClientFormOpen(true);
    };

    const handleDeleteClientClick = (client: Client) => {
        setSelectedClient(client);
        setDeleteDialogOpen(true);
    };

    const handleToggleStatusClick = (client: Client) => {
        setSelectedClient(client);
        setToggleStatusDialogOpen(true);
    };

    const handleConfirmDeleteClient = async () => {
        if (!selectedClient) return;
        setIsDeletingClient(true);
        try {
            await deleteClient(selectedClient.id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to delete client"));
        } finally {
            setIsDeletingClient(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const handleConfirmToggleStatus = async () => {
        if (!selectedClient) return;
        setIsTogglingStatus(true);
        try {
            const newStatus = !selectedClient.is_active;
            const formData = new FormData();
            formData.append('is_active', newStatus ? '1' : '0');
            formData.append('name', selectedClient.name);
            formData.append('gender', selectedClient.gender ?? '');
            formData.append('birthdate', selectedClient.birthdate ?? '');
            formData.append('phone', selectedClient.phone ?? '');
            formData.append('email', selectedClient.email);
            await updateClient(selectedClient.id, formData);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to update client status"));
        } finally {
            setIsTogglingStatus(false);
            setToggleStatusDialogOpen(false);
            refetch();
        }
    };

    const handleSubmitClientForm = async (data: any) => {
        try {
            const formData = new FormData();

            // Append simple fields
            formData.append('name', data.name);
            formData.append('gender', data.gender ?? '');
            formData.append('birthdate', data.birthdate ?? '');
            formData.append('phone', data.phone ?? '');
            formData.append('email', data.email);

            const response = editingClient
                ? await updateClient(editingClient.id, formData)
                : await createClient(data);

            if (response.result) {
                setEditingClient(null);
                setIsClientFormOpen(false);
                refetch();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to save client"));
        }
    };

    const columns = useClientColumns({
        handleEdit: handleEditClient,
        handleDelete: handleDeleteClientClick,
        handleToggleActive: handleToggleStatusClick,
    });

    const { data, isLoading, isError, refetch } = useClients({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const table = useReactTable({
        data: data?.clients || [],
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
        setIsClientFormOpen,
        isClientFormOpen,
        editingClient,
        setEditingClient,
        handleSubmitClientForm,

        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmDeleteClient,
            loading: isDeletingClient,
            title: t("Delete client"),
            description: t("Are you sure you want to delete? This action cannot be undone."),
        },

        toggleStatusDialogProps: {
            open: toggleStatusDialogOpen,
            onOpenChange: () => setToggleStatusDialogOpen(false),
            handleConfirm: handleConfirmToggleStatus,
            isLoading: isTogglingStatus,
            title: t("Change client status"),
            desc: selectedClient?.is_active
                ? t("Are you sure you want to deactivate this client?")
                : t("Are you sure you want to activate this client?"),
        },
    };
}