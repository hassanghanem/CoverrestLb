import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, SortingState } from "@tanstack/react-table";

import { useStockAdjustments } from "./useStockAdjustments";
import { useStockAdjustmentColumns } from "./useStockAdjustmentColumns";
import { PaginatedData, StockAdjustment } from "@/types/api.interfaces";
import { toast } from "sonner";
import { createStockManualAdjustment, deleteStockAdjustment } from "@/lib/services/StockAdjustments-services";
import { useProductVariants, useSettings } from "@/hooks/usePublicData";

export function useStockAdjustmentsTableLogic() {
  const { t } = useTranslation();
  const [isStockAdjustmentFormOpen, setIsStockAdjustmentFormOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Delete dialog state
  const [isDeletingAdjustment, setIsDeletingAdjustment] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: SettingsData } = useSettings();
  const warehouses = SettingsData?.warehouses || [];

  const missingItems: string[] = [];

  const { data, isLoading, isError, refetch } = useStockAdjustments({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
  });

  const handleDeleteAdjustmentClick = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteAdjustment = async () => {
    if (!selectedAdjustment) return;
    setIsDeletingAdjustment(true);
    try {
      await deleteStockAdjustment(selectedAdjustment.id);
      refetch();
    } catch {
      toast.error(t("Failed to delete the stock adjustment."));
    } finally {
      setIsDeletingAdjustment(false);
      setDeleteDialogOpen(false);
    }
  };

  const columns = useStockAdjustmentColumns({ handleDelete: handleDeleteAdjustmentClick });

  const table = useReactTable({
    data: data?.adjustments || [],
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

  const handleSubmitStockAdjustmentForm = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("variant_id", data.variant_id.toString());
      formData.append("warehouse_id", data.warehouse_id.toString());
      formData.append("direction", data.direction);
      formData.append("quantity", data.quantity.toString());
      if (data.cost_per_item) formData.append("cost_per_item", data.cost_per_item.toString());
      if (data.reason) formData.append("reason", data.reason);

      const response = await createStockManualAdjustment(formData);

      if (response.result) {
        setIsStockAdjustmentFormOpen(false);
        refetch();
      }

    } catch (error) {
      toast.error(t("Unexpected error occurred"));
    }
  };

  function useProductVariantData(searchTerm: string): PaginatedData<{ id: number; label: string }> {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError: isErrorfetch } = useProductVariants(searchTerm);

    const productVariants = data?.pages.flatMap(page => page.productVariants) || [];
    return {
      items: productVariants.map(v => ({ id: v.id, label: `${v.sku}` })),
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      isError: isErrorfetch
    };
  }

  return {
    t,
    table,
    columns,
    data,
    isLoading,
    isError,
    searchInput,
    setSearchInput,
    appliedSearch,
    handleSearch,
    handleRefresh,
    setIsStockAdjustmentFormOpen,
    isStockAdjustmentFormOpen,
    handleSubmitStockAdjustmentForm,
    useProductVariantData,
    missingItems,
    warehouses,
    deleteDialogProps: {
      open: deleteDialogOpen,
      onClose: () => setDeleteDialogOpen(false),
      onConfirm: handleConfirmDeleteAdjustment,
      loading: isDeletingAdjustment,
      title: t("Delete Stock Adjustment"),
      description: t("Are you sure you want to delete this stock adjustment? This action cannot be undone."),
    },
  };
}
