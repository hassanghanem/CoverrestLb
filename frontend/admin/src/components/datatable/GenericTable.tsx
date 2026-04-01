import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { TableCard } from "@/components/datatable/TableCard";
import { TablePagination } from "@/components/datatable/table-pagination";
import { TableLoading } from "@/components/datatable/table-loading";
import { TableNoResults } from "@/components/datatable/table-no-results";
import { flexRender } from "@tanstack/react-table";
import { TableSearch } from "@/components/datatable/table-search";
import { RefreshButton } from "@/components/datatable/RefreshButton";
import { Button } from "@/components/ui/button";

type GenericTableProps = {
    title: string;
    table: any;
    columns: any[];
    data: any;
    isLoading: boolean;
    isError: boolean;
    messages: (key: string) => string;
    searchInput?: string;
    setSearchInput?: (value: string) => void;
    onSearch?: () => void | Promise<any>;
    onRefresh?: () => void | Promise<any>;
    onAdd?: () => void;
    addButtonLabel?: string;
    additionalButtons?: React.ReactNode;
    DialogComponent?: React.ReactNode;
};

export function GenericTable({
    title,
    table,
    columns,
    data,
    isLoading,
    isError,
    messages: t,
    searchInput,
    setSearchInput,
    onSearch,
    onRefresh,
    onAdd,
    addButtonLabel,
    additionalButtons,
    DialogComponent,
}: GenericTableProps) {
    if (isError) return <div className="text-center py-10">{t("Error loading data")}</div>;

    return (
        <TableCard title={title}>
            {(setSearchInput || onRefresh || onAdd || additionalButtons) && (
                <div className="py-4">
                    <div className="flex flex-wrap items-center gap-2">

                        {/* Search */}
                        {setSearchInput && onSearch && (
                            <div className="flex-1 min-w-[200px] max-w-full sm:max-w-md">
                                <TableSearch
                                    value={searchInput ?? ""}
                                    onChange={setSearchInput}
                                    onSearch={async () => {
                                        if (onSearch) await onSearch();
                                    }}
                                    placeholder={t("Search...")}
                                />
                            </div>
                        )}

                        {/* Refresh */}
                        {onRefresh && (
                            <RefreshButton
                                onRefresh={async () => {
                                    await onRefresh();
                                }}
                            />
                        )}

                        {/* Add */}
                        {onAdd && (
                            <Button onClick={onAdd}>
                                {addButtonLabel ?? t("Add")}
                            </Button>
                        )}

                        {/* Additional Buttons */}
                        {additionalButtons && (
                            <div className="flex flex-wrap gap-2">
                                {additionalButtons}
                            </div>
                        )}
                    </div>
                </div>
            )}



            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => (
                                    <TableHead key={header.id} className="text-center">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableLoading colSpan={columns.length} />
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row: any) => {
                                const rowClassName = table.options.meta?.getRowClassName?.(row) || "";
                                return (
                                    <TableRow key={row.id} className={rowClassName}>
                                        {row.getVisibleCells().map((cell: any) => (
                                            <TableCell key={cell.id} className="text-center">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableNoResults colSpan={columns.length} message={t("No data found")} />
                        )}
                    </TableBody>
                </Table>
            </div>

            <TablePagination
                currentPageSize={table.getState().pagination.pageSize}
                totalItems={data?.pagination?.total || 0}
                visibleItems={table.getRowModel().rows.length}
                onPageSizeChange={(size) => table.setPageSize(size)}
                onPreviousPage={table.previousPage}
                onNextPage={table.nextPage}
                canPreviousPage={table.getCanPreviousPage()}
                canNextPage={table.getCanNextPage()}
            />

            {DialogComponent}
        </TableCard>
    );
}