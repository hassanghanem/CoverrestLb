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
import { toast } from "sonner";
import { useReturnOrders } from "./useReturnOrders";
import { useReturnOrderColumns } from "./useReturnOrderColumns";
import type { SortingState } from "@tanstack/react-table";
import { Order, PaginatedData } from "@/types/api.interfaces";
import { useOrdersCanBeReturned } from "@/hooks/usePublicData";
import { createReturnOrder } from "@/lib/services/ReturnOrders-services";

export function useReturnOrdersTableLogic() {
    const { t: messages } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isReturnOrderFormOpen, setIsReturnOrderFormOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const { data, isLoading, isError, refetch } = useReturnOrders({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        Returnorder: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const columns = useReturnOrderColumns();

    const table = useReactTable({
        data: data?.return_orders || [],
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
    const handleSubmitReturnOrderForm = async (data: any) => {
        try {
            const formData = new FormData();

            formData.append("order_id", data.order_id.toString());

            if (data.reason) {
                formData.append("reason", data.reason);
            }
            data.products.forEach((product: { variant_id: number; quantity: number }, index: number) => {
                formData.append(`products[${index}][variant_id]`, product.variant_id.toString());
                formData.append(`products[${index}][quantity]`, product.quantity.toString());
            });

            const response = await createReturnOrder(formData);

            if (response.result) {
                setIsReturnOrderFormOpen(false);
                refetch();
            }


        } catch (error) {
            toast.error(messages("Unexpected Error"));
        }
    };

    const handleRefresh = () => refetch();


    function useAllOrdersData(searchTerm: string): PaginatedData<{ id: number; label: string; order: Order }> {
        const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useOrdersCanBeReturned(searchTerm);

        const allOrders = data?.pages.flatMap(page => page.orders) || [];

        return {
            items: allOrders.map(order => ({
                id: order.id,
                label: `${order.order_number} - ${order.client.name}`,
                order,
            })),
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            isError,
        };
    }



    return {
        messages,
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
        useAllOrdersData,
        isReturnOrderFormOpen,
        setIsReturnOrderFormOpen,
        handleSubmitReturnOrderForm
    };
}
