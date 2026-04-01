import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Toggle } from "@/components/ui/toggle";
import { Address } from "@/types/api.interfaces";

type UseAddressColumnsProps = {
  handleEdit: (address: Address) => void;
  handleDelete: (address: Address) => void;
  handleToggleActive: (address: Address) => void;
  handleToggleDefault: (address: Address) => void;
};

export function useAddressColumns({
  handleEdit,
  handleDelete,
  handleToggleActive,
  handleToggleDefault,
}: UseAddressColumnsProps): ColumnDef<Address>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "recipient_name",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Recipient name")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.recipient_name || "").localeCompare(rowB.original.recipient_name || ""),
        cell: ({ row }) => <span>{row.original.recipient_name || "-"}</span>,
      },
      {
        accessorKey: "address",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Address")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.address || "").localeCompare(rowB.original.address || ""),
        cell: ({ row }) => <span>{row.original.address || "-"}</span>,
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("City")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.city || "").localeCompare(rowB.original.city || ""),
        cell: ({ row }) => <span>{row.original.city || "-"}</span>,
      },
      {
        accessorKey: "phone_number",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Phone Number")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.phone_number || "").localeCompare(rowB.original.phone_number || ""),
        cell: ({ row }) => <span>{row.original.phone_number || "-"}</span>,
      },
      {
        accessorKey: "notes",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Notes")} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <span title={row.original.notes || ""}>
            {row.original.notes ? 
              (row.original.notes.length > 50 
                ? `${row.original.notes.substring(0, 50)}...` 
                : row.original.notes)
              : "-"
            }
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Status")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.is_active) - Number(rowB.original.is_active),
        cell: ({ row }) => (
          <Toggle 
            pressed={row.original.is_active}
            onPressedChange={() => handleToggleActive(row.original)}
          >
            <Badge variant={row.original.is_active ? "default" : "destructive"}>
              {row.original.is_active ? t("Active") : t("Inactive")}
            </Badge>
          </Toggle>
        ),
      },
      {
        accessorKey: "is_default",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Default")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.is_default) - Number(rowB.original.is_default),
        cell: ({ row }) => (
          <Toggle 
            pressed={row.original.is_default}
            onPressedChange={() => handleToggleDefault(row.original)}
          >
            <Badge variant={row.original.is_default ? "default" : "outline"}>
              {row.original.is_default ? t("Yes") : t("No")}
            </Badge>
          </Toggle>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{t("Open menu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleEdit(row.original)}
                className="cursor-pointer"
              >
                {t("Edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original)}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                {t("Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDelete, handleToggleActive, handleToggleDefault, t]
  );
}