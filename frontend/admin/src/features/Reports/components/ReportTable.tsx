import { useState, useMemo, useRef, useEffect } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, ColumnDef, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Sheet, FileText, ChevronDown, Filter, X, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ReportConfig, FilterConfig } from "@/types/report";
import { useReport } from "../hooks/useReport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { TableLoading } from "@/components/datatable/table-loading";
import { TableNoResults } from "@/components/datatable/table-no-results";
import { flexRender } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { format } from 'date-fns';

interface ReportTableProps<T extends object> {
  title: string;
  reportHook: ReturnType<typeof useReport<T>>;
  config: ReportConfig;
  description?: string;
  onRefresh?: () => void;
}

// Filter Component
// Filter Component - Simplified version
const FilterComponent = ({
  filter,
  value,
  onChange,
  t
}: {
  filter: FilterConfig;
  value: any;
  onChange: (value: any) => void;
  t: (key: string) => string;
}) => {
  const getPlaceholder = () => {
    switch (filter.type) {
      case 'select':
        return t('Select') + ' ' + filter.label;
      case 'text':
      case 'number':
        return filter.placeholder || (t('Enter') + ' ' + filter.label);
      default:
        return '';
    }
  };

  switch (filter.type) {
    case 'date':
      return (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );
    case 'select':
      return (
        <Select
          value={value || ''}
          onValueChange={onChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={getPlaceholder()} />
          </SelectTrigger>
          <SelectContent>
            {(filter.options || []).map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'text':
    case 'number':
      return (
        <Input
          type={filter.type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full"
        />
      );

    default:
      return null;
  }
};

export const ReportTable = <T extends object>({
  title,
  reportHook,
  config,
  description,
  onRefresh,
}: ReportTableProps<T>) => {
  const { t } = useTranslation();

  const { data, loading, exportExcel, exportPDF, printReport, refetch, filters, updateFilter, clearFilters } = reportHook;
  const [searchInput, setSearchInput] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showFilters, setShowFilters] = useState(false);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Transform data for table
  const tableData = useMemo(() => data || [], [data]);

  // Create columns from config
  const columns = useMemo((): ColumnDef<T>[] => {
    return config.columns.map(column => ({
      id: column.key,
      accessorKey: column.key,
      header: ({ column: col }) => (
        <div
          className={`flex items-center gap-1 ${column.sortable ? 'cursor-pointer select-none hover:text-primary' : ''}`}
          onClick={() => column.sortable && col.toggleSorting()}
        >
          <span className="font-medium">{column.label}</span>
          {column.sortable && col.getIsSorted() && (
            <ChevronDown className={`h-4 w-4 transition-transform ${col.getIsSorted() === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </div>
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        return <span className="text-sm">{formatValue(value, column.type)}</span>;
      },
      enableSorting: column.sortable,
    }));
  }, [config.columns]);

  const formatValue = (value: any, columnType: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'status') => {
    if (value == null || value === '') return '-';

    switch (columnType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));

      case 'number':
        return new Intl.NumberFormat().format(Number(value));

      case 'date':
        return format(new Date(value), 'yyyy-MM-dd');

      case 'datetime':
        return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');

      case 'status':
        return (
          <Badge variant={value === 'completed' ? 'default' : 'secondary'}>
            {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
          </Badge>
        );

      case 'text':
      default:
        return String(value);
    }
  };

  // Safe state updater for pagination
  const handlePaginationChange = (updater: any) => {
    if (mountedRef.current) {
      setPagination(updater);
    }
  };

  // Initialize table
  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, globalFilter: searchInput, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchInput,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Reset page index safely when data changes
  useEffect(() => {
    if (mountedRef.current && tableData.length > 0) {
      const currentPageData = table.getRowModel().rows;
      if (currentPageData.length === 0 && pagination.pageIndex > 0) {
        table.setPageIndex(0);
      }
    }
  }, [tableData, pagination.pageIndex, table]);

  const handleRefresh = async () => {
    await refetch();
    if (mountedRef.current && onRefresh) onRefresh();
  };

  const hasActiveFilters = Object.values(filters).some(value => value != null && value !== '');

  const CustomHeader = () => (
    <div className="space-y-4">
      {/* Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="secondary" className="mt-1">
              {table.getFilteredRowModel().rows.length} {table.getFilteredRowModel().rows.length === 1 ? t("record") : t("records")}
            </Badge>
            {hasActiveFilters && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {t("Filtered")}
                <button onClick={clearFilters} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Filter Toggle */}
          {config.filters.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {t("Filters")}
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {Object.values(filters).filter(v => v != null && v !== '').length}
                </Badge>
              )}
            </Button>
          )}

          {config.exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  {t("Export")}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportExcel(title, config.columns)} className="gap-2">
                  <Sheet className="h-4 w-4" />
                  {t("Excel (.xlsx)")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPDF(title, config.columns)} className="gap-2">
                  <FileText className="h-4 w-4" />
                  {t("PDF")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {config.printable && (
            <Button onClick={() => printReport(title, config.columns)} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              {t("Print")}
            </Button>
          )}

          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("Refresh")}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && config.filters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t("Filters")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {config.filters.map(filter => (
                <div key={filter.key} className="space-y-2">
                  <Label htmlFor={filter.key} className="text-sm">
                    {filter.label}
                  </Label>
                  <FilterComponent
                    filter={filter}
                    value={filters[filter.key]}
                    onChange={(value) => updateFilter(filter.key, value)}
                    t={t}
                  />
                </div>
              ))}
            </div>
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  {t("Clear All Filters")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-4">
      <CustomHeader />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableLoading colSpan={columns.length} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableNoResults colSpan={columns.length} message={t("No data found")} />
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t("Showing {{count}} of {{total}} results", {
            count: table.getRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length
          })}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("Previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("Next")}
          </Button>
        </div>
      </div>
    </div>
  );
};