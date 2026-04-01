import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Warehouse } from "@/types/api.interfaces";

type UseWarehouseColumnsProps = {
  handleEdit: (warehouse: Warehouse) => void;
  handleDelete: (warehouse: Warehouse) => void;
};

export function useWarehouseColumns({ handleEdit, handleDelete }: UseWarehouseColumnsProps): ColumnDef<Warehouse>[] {
  const { t: messages } = useTranslation();

  return useMemo<ColumnDef<Warehouse>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => <TableHeaderSort column={column} title={messages("Name")} />,
      enableSorting: true,
      cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
      accessorKey: "location",
      header: ({ column }) => <TableHeaderSort column={column} title={messages("Location")} />,
      enableSorting: true,
      cell: ({ row }) => <span>{row.original.location}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{messages("Open menu")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{messages("Actions")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              {messages("Edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
              {messages("Delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [handleEdit, handleDelete, messages]);
}
