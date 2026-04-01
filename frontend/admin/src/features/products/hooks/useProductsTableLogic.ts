import { useCallback, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { deleteProduct } from "@/lib/services/Products-services";
import { toast } from "sonner";
import { Product } from "@/types/api.interfaces";
import { useProducts } from "./useProducts";
import type { SortingState } from "@tanstack/react-table";
import { useProductColumns } from "./useProductColumns";

export function useProductsTableLogic() {
    const { t: messages } = useTranslation();

    const [isDeletingProduct, setIsDeletingProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    // Debounce search input
    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setAppliedSearch(value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSearch(searchInput);
        return () => debouncedSearch.cancel();
    }, [searchInput, debouncedSearch]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({
        category_id: undefined,
        brand_id: undefined,
        availability_status: undefined,
        is_active: undefined,
        coupon_eligible: undefined,
        min_price: undefined,
        max_price: undefined,
        tag_id: undefined,
    });

    const handleDeleteProductClick = (product: Product) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const { data, isLoading, isError, refetch } = useProducts({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        sort: sorting.length ? (
            sorting[0].id === "category.name" ? "category_name" :
                sorting[0].id === "brand.name" ? "brand_name" :
                    sorting[0].id
        ) : undefined,
        order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
        search: appliedSearch,
        filters: filters,
    });

    const handleConfirmDeleteProduct = async () => {
        if (!selectedProduct) return;
        setIsDeletingProduct(true);
        try {
            await deleteProduct(selectedProduct.id);
        } catch {
            toast.error(messages("Failed to delete the product."));
        } finally {
            setIsDeletingProduct(false);
            setDeleteDialogOpen(false);
            refetch();
        }
    };

    const currentPageProductIds = useMemo(
        () => (data?.products || []).map((product) => product.id),
        [data?.products]
    );

    const toggleProductSelection = useCallback((productId: number, isSelected: boolean) => {
        setSelectedProductIds((prev) => {
            if (isSelected) {
                if (prev.includes(productId)) return prev;
                return [...prev, productId];
            }
            return prev.filter((id) => id !== productId);
        });
    }, []);

    const toggleCurrentPageSelection = useCallback(
        (isSelected: boolean, pageIds: number[]) => {
            setSelectedProductIds((prev) => {
                const next = new Set(prev);
                pageIds.forEach((id) => {
                    if (isSelected) {
                        next.add(id);
                    } else {
                        next.delete(id);
                    }
                });
                return Array.from(next);
            });
        },
        []
    );

    const columns = useProductColumns({
        handleDelete: handleDeleteProductClick,
        selectedProductIds,
        currentPageProductIds,
        onToggleProductSelection: toggleProductSelection,
        onToggleCurrentPageSelection: toggleCurrentPageSelection,
    });

    const table = useReactTable({
        data: data?.products || [],
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

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const handleClearFilters = () => {
        setFilters({
            category_id: undefined,
            brand_id: undefined,
            availability_status: undefined,
            is_active: undefined,
            coupon_eligible: undefined,
            min_price: undefined,
            max_price: undefined,
            tag_id: undefined,
        });
        setSearchInput("");
        setAppliedSearch("");
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const handleRefresh = () => refetch();

    return {
        messages,
        table,
        columns,
        data,
        isLoading,
        isError,
        appliedSearch,
        pagination,
        filters,
        handleSearch,
        handleFilterChange,
        handleClearFilters,
        handleRefresh,
        setSearchInput,
        searchInput,
        selectedProductIds,
        currentPageProductIds,
        sorting,
        setSorting,
        deleteDialogProps: {
            open: deleteDialogOpen,
            onClose: () => setDeleteDialogOpen(false),
            onConfirm: handleConfirmDeleteProduct,
            loading: isDeletingProduct,
            title: messages("Delete Product"),
            description: messages("Are you sure you want to delete this product?"),
        },
    };
}
