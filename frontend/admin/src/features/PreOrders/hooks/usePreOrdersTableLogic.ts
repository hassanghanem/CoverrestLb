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
import { usePreOrders } from "./usePreOrders";
import { usePreOrderColumns } from "./usePreOrderColumns";
import type { SortingState } from "@tanstack/react-table";
import { PaginatedData } from "@/types/api.interfaces";
import { useAllClients, useClientAddresses, useProductVariantsCanBePreOrder } from "@/hooks/usePublicData";
import { createPreOrder } from "@/lib/services/PreOrders-services";

export function usePreOrdersTableLogic() {
    const { t: messages } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isPreOrderFormOpen, setIsPreOrderFormOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const { data, isLoading, isError, refetch } = usePreOrders({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? sorting[0].id : undefined,
        Preorder: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
    });

    const columns = usePreOrderColumns();

    const table = useReactTable({
        data: data?.orders || [],
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
    const handleSubmitPreOrderForm = async (data: any) => {
        try {
            const formData = new FormData();

            formData.append("client_id", data.client_id.toString());
            formData.append("address_id", data.address_id.toString());

            if (data.coupon_code) {
                formData.append("coupon_code", data.coupon_code);
            }

            if (data.notes) {
                formData.append("notes", data.notes);
            }

            formData.append("payment_method", data.payment_method.toString());
            formData.append("payment_status", data.payment_status.toString());

            data.products.forEach((product: { variant_id: number; quantity: number }, index: number) => {
                formData.append(`products[${index}][variant_id]`, product.variant_id.toString());
                formData.append(`products[${index}][quantity]`, product.quantity.toString());
            });

            const response = await createPreOrder(formData);

            if (response.result) {
                setIsPreOrderFormOpen(false);
                refetch();
            }
        } catch (error) {
            toast.error(messages("An unexpected error occurred."));
        }
    };

    const handleRefresh = () => refetch();
    function useAllClientsData(searchTerm: string): PaginatedData<{ id: number; label: string }> {
        const {
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading, isError: isErrorfetch
        } = useAllClients(searchTerm);

        const AllData = data?.pages.flatMap((page) => page.clients) || [];
        return {
            items: AllData.map((v) => ({ id: v.id, label: `${v.name} (${v.email})`, })),
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            isError: isErrorfetch
        };
    }
    function useAllVariantsData(searchTerm: string): PaginatedData<{ id: number; label: string; available_quantity: number }> {
        const {
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading, isError: isErrorfetch
        } = useProductVariantsCanBePreOrder(searchTerm);

        const AllData = data?.pages.flatMap((page) => page.productVariants) || [];
        return {
            items: AllData.map((v) => ({ id: v.id, label: `${v.sku}`, available_quantity: v.available_quantity })),
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            isError: isErrorfetch
        };
    }


    function useAllAddressesData(searchTerm: string, selectedClientId?: number): PaginatedData<{ id: number; label: string }> {
        const {
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading, isError: isErrorfetch
        } = useClientAddresses(selectedClientId, searchTerm);

        const AllData = data?.pages.flatMap((page) => page.addresses) || [];
        return {
            items: AllData.map((v) => ({
                id: v.id,
                 label: ` ${v.city}, ${v.address}, (${v.recipient_name})`,
            })),
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading,
            isError: isErrorfetch
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
        useAllVariantsData,
        useAllClientsData,
        useAllAddressesData,
        isPreOrderFormOpen,
        setIsPreOrderFormOpen,
        handleSubmitPreOrderForm
    };
}
