import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { ReturnOrder } from "@/types/api.interfaces";
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

export function useReturnOrderColumns(): ColumnDef<ReturnOrder>[] {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMemo(
    () => [
      {
        accessorKey: "return_order_number",
        header: ({ column }) => <TableHeaderSort column={column} title={"#"} />,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            {row.original.return_order_number}
          </div>
        ),
      },
      {
        accessorKey: "order_number",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Order number")} />,
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            {row.original.order.order_number}
          </div>
        ),
      },
      {
        accessorKey: "client_name",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Client")} />,
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.order.client?.name}</span>,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Status")} />,
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status_info;
          return (
            <Badge style={{ backgroundColor: status?.color }} className={`text-white ${status?.class}`}>
              {status?.name}
            </Badge>
          );
        },
      },
      {
        accessorKey: "reason",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Reason")} />,
        enableSorting: true,
        cell: ({ row }) => row.original.reason,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Requested at")} />,
        enableSorting: true,
        sortingFn: (rowA, rowB) =>
          (rowA.original.created_at || "").localeCompare(rowB.original.created_at || ""),
        cell: ({ row }) => row.original.created_at || t("N/A"),
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
              <DropdownMenuItem onClick={() => navigate(`/return-orders/${row.original.id}/view`)}>
                {t("View")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate]
  );
}
