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
import { updateBrand, createBrand, deleteBrand } from "@/lib/services/Brands-services";
import { toast } from "sonner";
import { Brand } from "@/types/api.interfaces";
import type { SortingState } from "@tanstack/react-table";
import { useBrandColumns } from "./useBrandColumns";
import { useBrands } from "./useBrands";

export function useBrandsTableLogic() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [isBrandFormOpen, setIsBrandFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletingBrand, setIsDeletingBrand] = useState(false);

    const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const handleEditBrand = (brand: Brand) => {
        setEditingBrand(brand);
        setIsBrandFormOpen(true);
    };

    const handledeleteBrandClick = (brand: Brand) => {
        setSelectedBrand(brand);
        setDeleteDialogOpen(true);
    };

    const handleToggleStatusClick = (brand: Brand) => {
        setSelectedBrand(brand);
        setToggleStatusDialogOpen(true);
    };

    const handleConfirmdeleteBrand = async () => {
        if (!selectedBrand) return;
        setIsDeletingBrand(true);
        try {
            await deleteBrand(selectedBrand.id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to delete brand"));
        } finally {
            setIsDeletingBrand(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const handleConfirmToggleStatus = async () => {
        if (!selectedBrand) {
            return;
        }

        setIsTogglingStatus(true);

        try {
            const newStatus = !selectedBrand.is_active;
            const formData = new FormData();
            formData.append('is_active', newStatus ? '1' : '0');
            formData.append('name', selectedBrand.name);
            const response = await updateBrand(selectedBrand.id, formData);
            if (!response) {
                throw new Error("Empty response received");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to update brand status"));
        } finally {
            setIsTogglingStatus(false);
            setToggleStatusDialogOpen(false);
            refetch();
        }
    };

    const handleSubmitBrandForm = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);

            const response = editingBrand
                ? await updateBrand(editingBrand.id, formData)
                : await createBrand(formData);

            if (response.result) {
                setEditingBrand(null);
                setIsBrandFormOpen(false);
                refetch();
                dispatch(fetchSettings());
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t("Failed to save brand"));
        }
    };

    const columns = useBrandColumns({
        handleEdit: handleEditBrand,
        handleDelete: handledeleteBrandClick,
        handleToggleActive: handleToggleStatusClick,
    });

    const { data, isLoading, isError, refetch } = useBrands({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const table = useReactTable({
        data: data?.brands || [],
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
        setIsBrandFormOpen,
        isBrandFormOpen,
        editingBrand,
        setEditingBrand,
        handleSubmitBrandForm,

        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmdeleteBrand,
            loading: isDeletingBrand,
            title: t("Delete brand"),
            description: t("Are you sure you want to delete this brand? This action cannot be undone."),
        },

        toggleStatusDialogProps: {
            open: toggleStatusDialogOpen,
            onOpenChange: () => setToggleStatusDialogOpen(false),
            handleConfirm: handleConfirmToggleStatus,
            isLoading: isTogglingStatus,
            title: t("Change brand status"),
            desc: selectedBrand?.is_active
                ? t("Are you sure you want to deactivate this brand?")
                : t("Are you sure you want to activate this brand?"),
        },
    };
}