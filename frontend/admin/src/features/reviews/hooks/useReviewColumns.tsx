import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Review } from "@/types/api.interfaces";
import { Toggle } from "@/components/ui/toggle";

type UseReviewColumnsProps = {
  handleToggleActive: (review: Review) => void;
};

export function useReviewColumns({ handleToggleActive }: UseReviewColumnsProps): ColumnDef<Review>[] {
  const { t } = useTranslation();

  return useMemo(() => [
    {
      id: "product_name",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Product")} />,
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
            <div>
              <span>{row.original.product?.barcode}-{row.original.product?.name.en}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "client_name",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Client")} />,
      enableSorting: true,
      cell: ({ row }) => <span>{row.original.client?.name}</span>,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Rating")} />,
      enableSorting: true,
      cell: ({ row }) => <span>{row.original.rating}</span>,
    },
    {
      accessorKey: "comment",
      header: t("Comment"),
      cell: ({ row }) => (
        <div className="line-clamp-2 text-sm text-muted-foreground max-w-xs">
          {row.original.comment}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Is Active")} />,
      enableSorting: true,
      cell: ({ row }) => (
        <Toggle onClick={() => handleToggleActive(row.original)}>
          <Badge variant={row.original.is_active ? "default" : "destructive"}>
            {row.original.is_active ? t("Active") : t("Inactive")}
          </Badge>
        </Toggle>
      ),
    },
  ], [handleToggleActive, t]);
}
