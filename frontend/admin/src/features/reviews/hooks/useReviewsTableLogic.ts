import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { updateReview } from "@/lib/services/Reviews-services";
import { toast } from "sonner";
import { Review } from "@/types/api.interfaces";
import { useReviews } from "./useReviews";
import type { SortingState } from "@tanstack/react-table";
import { useReviewColumns } from "./useReviewColumns";

export function useReviewsTableLogic() {
    const { t } = useTranslation();
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);

    const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const handleToggleStatusClick = (review: Review) => {
        setSelectedReview(review);
        setToggleStatusDialogOpen(true);
    };

    const handleConfirmToggleStatus = async () => {
        if (!selectedReview) return;

        setIsTogglingStatus(true);

        try {
            const newStatus = !selectedReview.is_active;
            const formData = new FormData();
            formData.append('is_active', newStatus ? '1' : '0');
            const response = await updateReview(selectedReview.id, formData);
            if (!response) throw new Error(t("Empty response received"));
        } catch (error) {
            toast.error(t("Status update failed"));
        } finally {
            setIsTogglingStatus(false);
            setToggleStatusDialogOpen(false);
            refetch();
        }
    };

    const columns = useReviewColumns({
        handleToggleActive: handleToggleStatusClick,
    });

    const { data, isLoading, isError, refetch } = useReviews({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const table = useReactTable({
        data: data?.reviews || [],
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
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
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

        toggleStatusDialogProps: {
            open: toggleStatusDialogOpen,
            onOpenChange: () => setToggleStatusDialogOpen(false),
            handleConfirm: handleConfirmToggleStatus,
            isLoading: isTogglingStatus,
            title: t("Toggle Status"),
            desc: selectedReview?.is_active
                ? t("Are you sure you want to deactivate this review?")
                : t("Are you sure you want to activate this review?"),
        },
    };
}
