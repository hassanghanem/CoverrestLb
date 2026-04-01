import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, SortingState } from "@tanstack/react-table";

import { useStocks } from "./useStocks";
import { useStockColumns } from "./useStockColumns";
import { useSettings } from "@/hooks/usePublicData";


export function useStocksTableLogic() {
  const { t: messages } = useTranslation();
  const { data: settingsData } = useSettings();
  
  const minStockAlert = settingsData?.configurations?.find(
    (config) => config.key === "min_stock_alert"
  )?.value;
  const minAlertThreshold = minStockAlert ? Number(minStockAlert) : 0;
  
  const columns = useStockColumns();

  const [sorting, setSorting] = useState<SortingState>([]);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading, isError, refetch } = useStocks({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
  });

  const table = useReactTable({
    data: data?.stocks || [],
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
    meta: {
      getRowClassName: (row: any) => {
        const stock = row.original;
        if (minAlertThreshold > 0 && stock.quantity <= minAlertThreshold) {
          return "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500";
        }
        return "";
      },
    },
  });

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleRefresh = () => refetch();

  return {
    messages,
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
  };
}
