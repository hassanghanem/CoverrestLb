import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Order } from "@/types/api.interfaces";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { formatPrice } from "@/utils/formatPrice";

export function usePreOrderColumns(): ColumnDef<Order>[] {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const selectedCurrency = useSelector(
    (state: RootState) => state.currency.selectedCurrency
  );

  return useMemo(
    () => [
      {
        accessorKey: "order_number",
        header: ({ column }) => <TableHeaderSort column={column} title="#" />,
        enableSorting: true,
        cell: ({ row }) => {
          const isViewed = row.original.is_view;
          return (
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              {!isViewed && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-600 px-1 py-0 text-[10px] font-medium"
                >
                  {t("Unread")}
                </Badge>
              )}
              {row.original.order_number || "—"}
            </div>
          );
        },
      },

      {
        accessorKey: "client_name",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Client")} />
        ),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.client?.name || t("Guest")}</span>,
      },

      {
        accessorKey: "status",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Status")} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status_info;
          if (!status)
            return (
              <Badge className="bg-gray-400 text-white">{t("Unknown")}</Badge>
            );
          return (
            <Badge
              style={{ backgroundColor: status.color }}
              className={`text-white ${status.class}`}
            >
              {status.name}
            </Badge>
          );
        },
      },

      {
        accessorKey: "subtotal",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Subtotal")} />
        ),
        enableSorting: true,
        cell: ({ row }) =>
          formatPrice(
            (row.original.subtotal ?? 0) *
              (selectedCurrency?.exchange_rate ?? 1),
            selectedCurrency?.code,
            i18n.language
          ),
      },

      {
        accessorKey: "delivery_amount",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Delivery Fee")} />
        ),
        enableSorting: true,
        cell: ({ row }) =>
          formatPrice(
            (row.original.delivery_amount ?? 0) *
              (selectedCurrency?.exchange_rate ?? 1),
            selectedCurrency?.code,
            i18n.language
          ),
      },

      {
        accessorKey: "coupon_value",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Coupon")} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const { coupon_value, coupon_type } = row.original;
          if (!coupon_value) return <span>{t("N/A")}</span>;

          return (
            <span>
              {coupon_type === "percentage"
                ? `${coupon_value}%`
                : formatPrice(
                    coupon_value * (selectedCurrency?.exchange_rate ?? 1),
                    selectedCurrency?.code,
                    i18n.language
                  )}
            </span>
          );
        },
      },

      {
        accessorKey: "grand_total",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Total")} />
        ),
        enableSorting: true,
        cell: ({ row }) =>
          formatPrice(
            parseFloat(row.original.grand_total ?? "0") *
              (selectedCurrency?.exchange_rate ?? 1),
            selectedCurrency?.code,
            i18n.language
          ),
      },

      {
        accessorKey: "payment_method",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Payment Method")} />
        ),
        enableSorting: true,
         cell: ({ row }) => <span>{t(row.original.payment_method) || t("N/A")}</span>,
      },

      {
        accessorKey: "payment_status",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Payment Status")} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const statusMap: Record<number, { label: string; color: string }> = {
            0: { label: t("Pending"), color: "bg-yellow-500" },
            1: { label: t("Paid"), color: "bg-green-500" },
            2: { label: t("Payment Failed"), color: "bg-red-500" },
            3: { label: t("Refunded"), color: "bg-blue-500" },
          };

          const statusInfo =
            statusMap[row.original.payment_status] || {
              label: t("N/A"),
              color: "bg-gray-400",
            };

          return (
            <Badge className={`${statusInfo.color} text-white`}>
              {statusInfo.label}
            </Badge>
          );
        },
      },

      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Created At")} />
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.created_at || "").localeCompare(
            rowB.original.created_at || ""
          ),
        cell: ({ row }) => (
          <span>{row.original.created_at || t("N/A")}</span>
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
              <DropdownMenuItem
                onClick={() => navigate(`/pre-orders/${row.original.id}/view`)}
              >
                {t("View")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, i18n.language, navigate, selectedCurrency]
  );
}
