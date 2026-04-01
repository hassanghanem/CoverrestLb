import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { StockAdjustment } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { TableHeaderText } from "@/components/datatable/table-header-text";
import { formatPrice } from '@/utils/formatPrice';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type UseStockAdjustmentColumnsProps = {
  handleDelete: (adjustment: StockAdjustment) => void;
};

export function useStockAdjustmentColumns({ handleDelete }: UseStockAdjustmentColumnsProps): ColumnDef<StockAdjustment>[] {
  const { t, i18n } = useTranslation();
  const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
  const user = useSelector((state: RootState) => state.auth.user);

  // Check if user has delete permission
  const hasDeletePermission = user?.permissions.some(p => p === 'delete-stock_adjustment');

  return useMemo<ColumnDef<StockAdjustment>[]>(() => [
    {
      accessorKey: "sku",
      header: () => <TableHeaderText title={t("SKU")} />,
      enableSorting: false,
      cell: ({ row }) => <p>{row.original.sku}</p>,
    },
    {
      accessorKey: "type",
      header: () => <TableHeaderText title={t("Type")} />,
      cell: ({ row }) => <p>{row.original.type}</p>,
    },
    {
      accessorKey: "quantity",
      header: () => <TableHeaderText title={t("Quantity")} />,
      cell: ({ row }) => <p>{row.original.quantity}</p>,
    },
    {
      accessorKey: "cost_per_item",
      header: () => <TableHeaderText title={t("Cost per item")} />,
      cell: ({ row }) => {
        const cost = row.original.cost_per_item;
        if (cost == null) return <p>—</p>;
        return (
          <p>
            {formatPrice(cost * selectedCurrency.exchange_rate, selectedCurrency.code, i18n.language)}
          </p>
        );
      },

    },
    {
      accessorKey: "warehouse",
      header: () => <TableHeaderText title={t("Warehouse")} />,
      cell: ({ row }) => <p>{row.original.warehouse?.name}</p>,
    },
    {
      accessorKey: "reason",
      header: () => <TableHeaderText title={t("Reason")} />,
      cell: ({ row }) => <p>{row.original.reason || "-"}</p>,
    },
    {
      accessorKey: "adjusted_by",
      header: () => <TableHeaderText title={t("Adjusted by")} />,
      cell: ({ row }) => <p>{row.original.adjusted_by?.name || "-"}</p>,
    },

    {
      accessorKey: "created_at",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Created At")} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) =>
        (rowA.original.created_at || "").localeCompare(rowB.original.created_at || ""),
      cell: ({ row }) => <span>{row.original.created_at || t("N/A")}</span>,
    },
    {
      id: "actions",
      header: () => <TableHeaderText title={t("Actions")} />,
      cell: ({ row }) => {
        const isManual = row.original.type === 'manual';

        if (!isManual || !hasDeletePermission) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
      enableSorting: false,
    },
  ], [t, selectedCurrency, i18n.language, hasDeletePermission, handleDelete]);
}
