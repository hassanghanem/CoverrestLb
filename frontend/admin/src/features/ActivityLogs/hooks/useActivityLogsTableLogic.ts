import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, SortingState } from "@tanstack/react-table";
import { useActivityLogs } from "./useActivityLogs";
import { useActivityLogColumns } from "./useActivityLogColumns";


export function useActivityLogsTableLogic() {
  const { t: messages } = useTranslation();
  const columns = useActivityLogColumns();

  const [sorting, setSorting] = useState<SortingState>([]);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading, isError, refetch } = useActivityLogs({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    sort: sorting.length ? sorting[0].id : undefined,
    order: sorting.length ? (sorting[0].desc ? "desc" : "asc") : undefined,
    search: appliedSearch,
  });

  const table = useReactTable({
    data: data?.logs || [],
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
