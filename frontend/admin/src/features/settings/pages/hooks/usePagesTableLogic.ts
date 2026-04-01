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
import { updatePage } from "@/lib/services/Pages-services";
import { toast } from "sonner";
import { usePages } from "./usePages"; import type { SortingState } from "@tanstack/react-table";
import { usePageColumns } from "./usePageColumns";
import { Page } from "@/types/api.interfaces";
import { PageFormValues } from "@/types/form.interfaces";

export function usePagesTableLogic() {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [isPageFormOpen, setIsPageFormOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const handleEditPage = (page: Page) => {
        setEditingPage(page);
        setIsPageFormOpen(true);
    };

    const handleSubmitPageForm = async (data: PageFormValues) => {
        if (!editingPage) return;
        try {
            const formData = new FormData();

            Object.entries(data.title).forEach(([lang, value]) => {
                formData.append(`title[${lang}]`, value);
            });

            Object.entries(data.content).forEach(([lang, value]) => {
                formData.append(`content[${lang}]`, value);
            });

            const response = await updatePage(editingPage.id, formData);

            if (response.result) {
                setEditingPage(null);
                setIsPageFormOpen(false);
                refetch();
                dispatch(fetchSettings());
            } else {
                toast.error(response.message || t("Unexpected Error"));
            }
        } catch (error) {
            toast.error(t("Unexpected Error"));
        }
    };

    const { data, isLoading, isError, refetch } = usePages({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const columns = usePageColumns({
        handleEdit: handleEditPage,
    });

    const table = useReactTable({
        data: data?.pages || [],
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
        setIsPageFormOpen,
        isPageFormOpen,
        editingPage,
        setEditingPage,
        handleSubmitPageForm,
    };
}
