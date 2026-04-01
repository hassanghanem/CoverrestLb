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
import { useNavigate } from "react-router-dom";
import { Coupon } from "@/types/api.interfaces";
import { formatPrice } from '@/utils/formatPrice';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
type UseCouponColumnsProps = {
  handleEdit: (coupon: Coupon) => void;
  handleDelete: (coupon: Coupon) => void;
};

export function useCouponColumns({
  handleEdit,
  handleDelete,
}: UseCouponColumnsProps): ColumnDef<Coupon>[] {
  const { t, i18n } = useTranslation();
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);


  const navigate = useNavigate();

  return useMemo(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Code")} />,
        enableSorting: true,
        sortingFn: (rowA, rowB) => rowA.original.code.localeCompare(rowB.original.code),
        cell: ({ row }) => <span className="font-semibold text-sm text-gray-900 dark:text-white">{row.original.code}</span>,
      },
      {
        accessorKey: "coupon_type",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Coupon type")} />,
        enableSorting: true,
        cell: ({ row }) => <b>{row.original.coupon_type_attributes}</b>,
      },
      {
        accessorKey: "type",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Type")} />,
        enableSorting: true,
        sortingFn: (rowA, rowB) => rowA.original.type.localeCompare(rowB.original.type),
        cell: ({ row }) => <Badge variant="secondary">{t(row.original.type === "fixed" ? "Fixed" : "Percentage")}</Badge>,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Status")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status_attributes;
          return (
            <Badge style={{ backgroundColor: status.color }} className={`text-white ${status.class}`}>
              {status.name}
            </Badge>
          );
        },
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Value")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) => (rowA.original.value ?? 0) - (rowB.original.value ?? 0),
        cell: ({ row }) => {
          const { value, type } = row.original;
          if (value == null) return <span>—</span>;

          return (
            <span>
              {type === "fixed"
                ? formatPrice(value, selectedCurrency.code, i18n.language)
                : `${value}%`}
            </span>
          );
        },
      },

      {
        accessorKey: "valid_from",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Valid from")} />,
        enableSorting: true,
        sortingFn: (rowA, rowB) => (rowA.original.valid_from || "").localeCompare(rowB.original.valid_from || ""),
        cell: ({ row }) => row.original.valid_from || t("N/A"),
      },
      {
        accessorKey: "valid_to",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Valid to")} />,
        enableSorting: true,
        sortingFn: (rowA, rowB) => (rowA.original.valid_to || "").localeCompare(rowB.original.valid_to || ""),
        cell: ({ row }) => row.original.valid_to || t("N/A"),
      },
      {
        accessorKey: "usage_limit",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Usage limit")} />,
        enableSorting: true,
        cell: ({ row }) => row.original.usage_limit ?? t("N/A"),
      },
      {
        accessorKey: "usage_count",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Usage count")} />,
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.usage_count}</span>,
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
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>{t("Edit")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
                {t("Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDelete, t, navigate]
  );
}
