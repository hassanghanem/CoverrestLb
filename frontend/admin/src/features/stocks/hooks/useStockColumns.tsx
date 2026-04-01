import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Stock } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useSettings } from "@/hooks/usePublicData";
import { AlertTriangle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openBulkBarcodesPrint } from "@/lib/services/Products-services";

export function useStockColumns(): ColumnDef<Stock>[] {
  const { t } = useTranslation();
  const { data: settingsData } = useSettings();

  const minStockAlert = settingsData?.configurations?.find(
    (config) => config.key === "min_stock_alert"
  )?.value;
  const minAlertThreshold = minStockAlert ? Number(minStockAlert) : 0;

  return useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        accessorKey: "sku",
        id: "sku",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("SKU")} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const isLowStock =
            minAlertThreshold > 0 && quantity <= minAlertThreshold;

          return (
            <p className={isLowStock ? "text-red-600" : ""}>
              {row.original.sku}
            </p>
          );
        },
      },
      {
        accessorKey: "warehouse.name",
        id: "warehouse_name",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Warehouse")} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const isLowStock =
            minAlertThreshold > 0 && quantity <= minAlertThreshold;

          return (
            <p className={isLowStock ? "text-red-600" : ""}>
              {row.original.warehouse.name}
            </p>
          );
        },
      },
      {
        accessorKey: "quantity",
        id: "quantity",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Quantity")} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const isLowStock =
            minAlertThreshold > 0 && quantity <= minAlertThreshold;

          return (
            <div className="flex items-center gap-2">
              {isLowStock && (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className={isLowStock ? "font-semibold text-red-600" : ""}>
                {quantity}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span>{t("Actions")}</span>,
        enableSorting: false,
        cell: ({ row }) => {
          const quantity = row.original.quantity;
          const isLowStock =
            minAlertThreshold > 0 && quantity <= minAlertThreshold;

          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={
                isLowStock
                  ? "text-red-600 border-red-600 hover:text-red-600 hover:border-red-700 hover:bg-red-50 cursor-pointer"

                  : "hover:cursor-pointer"
              }
              onClick={async () => {
                await openBulkBarcodesPrint({ variantIds: [row.original.id] });
              }}
            >
              <Printer className="h-4 w-4 mr-1" />
              {t("Print Barcode")}
            </Button>
          );
        },
      },
    ],
    [t, minAlertThreshold]
  );
}
