import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { deleteHomeSection, updateHomeSection } from "@/lib/services/HomeSections-services";
import { toast } from "sonner";
import { HomeSection } from "@/types/api.interfaces";
import { useHomeSections } from "./useHomeSections";
import type { SortingState } from "@tanstack/react-table";
import { useHomeSectionColumns } from "./useHomeSectionColumns";

export function useHomeSectionsTableLogic() {
    const { t } = useTranslation();

    const [isDeletingHomeSection, setIsDeletingHomeSection] = useState(false);
    const [selectedHomeSection, setSelectedHomeSection] = useState<HomeSection | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const handleToggleStatusClick = (homeSection: HomeSection) => {
        setSelectedHomeSection(homeSection);
        setToggleStatusDialogOpen(true);
    };

    const handleDeleteHomeSectionClick = (homeSection: HomeSection) => {
        setSelectedHomeSection(homeSection);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDeleteHomeSection = async () => {
        if (!selectedHomeSection) return;
        setIsDeletingHomeSection(true);
        try {
           await deleteHomeSection(selectedHomeSection.id);
        } catch {
            toast.error(t("Delete failed"));
        } finally {
            setIsDeletingHomeSection(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const handleConfirmToggleStatus = async () => {
        if (!selectedHomeSection) return;

        setIsTogglingStatus(true);

        try {
            const newStatus = !selectedHomeSection.is_active;
            const formData = new FormData();
            formData.append('is_active', newStatus ? '1' : '0');
            formData.append('title[en]', selectedHomeSection.title.en);
            formData.append('title[ar]', selectedHomeSection.title.ar);
            formData.append('arrangement', selectedHomeSection.arrangement.toString());
            formData.append('type', selectedHomeSection.type.toString());
            const response = await updateHomeSection(selectedHomeSection.id, formData);
            if (!response) {
                throw new Error("Empty response received");
            }
        } catch (error) {
            toast.error(t("Status update failed"));
        } finally {
            setIsTogglingStatus(false);
            setToggleStatusDialogOpen(false);
            refetch();
        }
    };

    const columns = useHomeSectionColumns({
        handleDelete: handleDeleteHomeSectionClick,
        handleToggleActive: handleToggleStatusClick,
    });

    const { data, isLoading, isError, refetch } = useHomeSections({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const table = useReactTable({
        data: data?.home_sections || [],
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
        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmDeleteHomeSection,
            loading: isDeletingHomeSection,
            title: t("Delete Home Section"),
            description: t("Confirm delete this home section"),
        },
        toggleStatusDialogProps: {
            open: toggleStatusDialogOpen,
            onOpenChange: () => setToggleStatusDialogOpen(false),
            handleConfirm: handleConfirmToggleStatus,
            isLoading: isTogglingStatus,
            title: t("Toggle Status"),
            desc: selectedHomeSection?.is_active
                ? t("Confirm deactivation")
                : t("Confirm activation"),
        },
    };
}
