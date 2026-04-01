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
import { updateCategory, createCategory, deleteCategory } from "@/lib/services/Categories-services";
import { toast } from "sonner";
import { Category } from "@/types/api.interfaces";
import { useCategories } from "./useCategories";
import type { SortingState } from "@tanstack/react-table";
import { useCategoryColumns } from "./useCategoryColumns";
import { CategoryFormValues } from "@/types/form.interfaces";

export function useCategoriesTableLogic() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletingCategory, setIsDeletingCategory] = useState(false);

    const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setIsCategoryFormOpen(true);
    };

    const handleDeleteCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    };

    const handleToggleStatusClick = (category: Category) => {
        setSelectedCategory(category);
        setToggleStatusDialogOpen(true);
    };

    const handleConfirmDeleteCategory = async () => {
        if (!selectedCategory) return;
        setIsDeletingCategory(true);
        try {
            await deleteCategory(selectedCategory.id);
        } catch {
            toast.error(t("Failed to delete category"));
        } finally {
            setIsDeletingCategory(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const handleConfirmToggleStatus = async () => {
        if (!selectedCategory) return;

        setIsTogglingStatus(true);

        try {
            const newStatus = !selectedCategory.is_active;
            const formData = new FormData();
            formData.append("is_active", newStatus ? "1" : "0");
            Object.entries(selectedCategory.name).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, value);
            });
            formData.append("arrangement", selectedCategory.arrangement.toString());
            const response = await updateCategory(selectedCategory.id, formData);
            if (!response) throw new Error("Empty response received");
        } catch {
            toast.error(t("Failed to update category status"));
        } finally {
            setIsTogglingStatus(false);
            setToggleStatusDialogOpen(false);
            refetch();
        }
    };

    const handleSubmitCategoryForm = async (data: CategoryFormValues) => {
        try {
            const formData = new FormData();
            Object.entries(data.name).forEach(([lang, value]) => {
                formData.append(`name[${lang}]`, value);
            });
            if (data.arrangement) formData.append("arrangement", data.arrangement);

            if (!editingCategory) {
                if (data.image instanceof File) {
                    formData.append("image", data.image);
                } else {
                    throw new Error(t("Image is required"));
                }
            } else {
                if (data.image instanceof File) {
                    formData.append("image", data.image);
                }
            }

            const response = editingCategory
                ? await updateCategory(editingCategory.id, formData)
                : await createCategory(formData);

            if (response.result) {
                setEditingCategory(null);
                setIsCategoryFormOpen(false);
                refetch();
                dispatch(fetchSettings());
            }
        } catch {
            toast.error(t("An unexpected error occurred"));
        }
    };

    const columns = useCategoryColumns({
        handleEdit: handleEditCategory,
        handleDelete: handleDeleteCategoryClick,
        handleToggleActive: handleToggleStatusClick,
    });

    const { data, isLoading, isError, refetch } = useCategories({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const arrangements = Array.isArray(data?.categories)
        ? data.categories.map((category) => category.arrangement)
        : [];

    const table = useReactTable({
        data: data?.categories || [],
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
        t,
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
        setIsCategoryFormOpen,
        isCategoryFormOpen,
        editingCategory,
        setEditingCategory,
        handleSubmitCategoryForm,

        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmDeleteCategory,
            loading: isDeletingCategory,
            title: t("Delete Category"),
            description: t("Are you sure you want to delete this category?"),
        },

        toggleStatusDialogProps: {
            open: toggleStatusDialogOpen,
            onOpenChange: () => setToggleStatusDialogOpen(false),
            handleConfirm: handleConfirmToggleStatus,
            isLoading: isTogglingStatus,
            title: t("Toggle Status"),
            desc: selectedCategory?.is_active
                ? t("Are you sure you want to deactivate this category?")
                : t("Are you sure you want to activate this category?"),
        },
        arrangements,
    };
}
