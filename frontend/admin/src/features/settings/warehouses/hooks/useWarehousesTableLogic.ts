import { useState } from "react";
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
import { updateWarehouse, createWarehouse, deleteWarehouse } from "@/lib/services/Warehouses-services";
import { toast } from "sonner";
import { Warehouse } from "@/types/api.interfaces";
import type { SortingState } from "@tanstack/react-table";
import { useWarehouseColumns } from "./useWarehouseColumns";
import { useWarehouses } from "./useWarehouses";

export function useWarehousesTableLogic() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [isWarehouseFormOpen, setIsWarehouseFormOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletingWarehouse, setIsDeletingWarehouse] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const handleEditWarehouse = (warehouse: Warehouse) => {
        setEditingWarehouse(warehouse);
        setIsWarehouseFormOpen(true);
    };

    const handledeleteWarehouseClick = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setDeleteDialogOpen(true);
    };

    const handleConfirmdeleteWarehouse = async () => {
        if (!selectedWarehouse) return;
        setIsDeletingWarehouse(true);
        try {
            await deleteWarehouse(selectedWarehouse.id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to delete warehouse"));
        } finally {
            setIsDeletingWarehouse(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const handleSubmitWarehouseForm = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('location', data.location);
            const response = editingWarehouse
                ? await updateWarehouse(editingWarehouse.id, formData)
                : await createWarehouse(formData);

            if (response.result) {
                setEditingWarehouse(null);
                setIsWarehouseFormOpen(false);
                refetch();
                dispatch(fetchSettings());
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to save warehouse"));
        }
    };

    const columns = useWarehouseColumns({
        handleEdit: handleEditWarehouse,
        handleDelete: handledeleteWarehouseClick,
    });

    const { data, isLoading, isError, refetch } = useWarehouses({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const table = useReactTable({
        data: data?.warehouses || [],
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
        setIsWarehouseFormOpen,
        isWarehouseFormOpen,
        editingWarehouse,
        setEditingWarehouse,
        handleSubmitWarehouseForm,

        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmdeleteWarehouse,
            loading: isDeletingWarehouse,
            title: t("Delete warehouse"),
            description: t("Are you sure you want to delete this warehouse? This action cannot be undone."),
        },
    };
}