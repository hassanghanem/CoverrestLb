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
import { Client } from "@/types/api.interfaces"; // adjust import path
import { useNavigate } from "react-router-dom";

type UseClientColumnsProps = {
  handleEdit: (client: Client) => void;
  handleDelete: (client: Client) => void;
  handleToggleActive: (client: Client) => void;
};

export function useClientColumns({
  handleEdit,
  handleDelete,
  handleToggleActive,
}: UseClientColumnsProps): ColumnDef<Client>[] {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Name")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          rowA.original.name.localeCompare(rowB.original.name),
        cell: ({ row }) => (
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Email")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          rowA.original.email.localeCompare(rowB.original.email),
        cell: ({ row }) => <p className="font-medium">{row.original.email}</p>,
      },
      {
        accessorKey: "gender",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Gender")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.gender || "").localeCompare(rowB.original.gender || ""),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.gender ? t(row.original.gender) : t("Unknown")}
          </Badge>
        ),
      },
      {
        accessorKey: "birthdate",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Birthdate")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.birthdate || "";
          const b = rowB.original.birthdate || "";
          return a.localeCompare(b);
        },
        cell: ({ row }) => <span>{row.original.birthdate || t("N/A")}</span>,
      },
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Phone")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.phone || "").localeCompare(rowB.original.phone || ""),
        cell: ({ row }) => <span>{row.original.phone || t("N/A")}</span>,
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Is Active")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.is_active) - Number(rowB.original.is_active),
        cell: ({ row }) => (
          <Toggle onClick={() => handleToggleActive(row.original)}>
            <Badge variant={row.original.is_active ? "default" : "destructive"}>
              {row.original.is_active ? t("Active") : t("Inactive")}
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
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/clients/${row.original.id}/addresses`)}>
                {t("Addresses")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                {t("Edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
                {t("Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDelete, handleToggleActive, t, navigate]
  );
}
