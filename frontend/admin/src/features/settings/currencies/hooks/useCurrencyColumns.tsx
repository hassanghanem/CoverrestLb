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
import { MoreHorizontal } from "lucide-react";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Currency } from "@/types/api.interfaces";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGS } from "@/i18n";

type UseCurrencyColumnsProps = {
  handleEdit: (currency: Currency) => void;
  handleDelete: (currency: Currency) => void;
  handleToggleDefault: (currency: Currency) => void;
};

export function useCurrencyColumns({
  handleEdit,
  handleDelete,
  handleToggleDefault,
}: UseCurrencyColumnsProps): ColumnDef<Currency>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Name")} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col space-y-1">
            {SUPPORTED_LANGS.map((lang) => (
              <div key={lang}>
                {lang.toUpperCase()}: <span>{row.original.name?.[lang]}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Code")} />
        ),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.code}</span>,
      },
      {
        accessorKey: "symbol",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Symbol")} />
        ),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.symbol || "-"}</span>,
      },
      {
        accessorKey: "exchange_rate",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Exchange Rate")} />
        ),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.exchange_rate}</span>,
      },
      {
        accessorKey: "is_default",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Is Default")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.is_default) - Number(rowB.original.is_default),
        cell: ({ row }) => (
          <Toggle onClick={() => !row.original.is_default && handleToggleDefault(row.original)}>
            <Badge variant={row.original.is_default ? "default" : "outline"}>
              {row.original.is_default ? t("Default") : t("Not Default")}
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
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                {t("Edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original)}
                className="text-red-600 focus:text-red-600"
              >
                {t("Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDelete, handleToggleDefault, t]
  );
}
