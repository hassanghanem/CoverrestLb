import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Contact } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { TableHeaderText } from "@/components/datatable/table-header-text";
import { Badge } from "@/components/ui/badge";

export function useContactColumns(): ColumnDef<Contact>[] {
  const { t } = useTranslation();

  return useMemo<ColumnDef<Contact>[]>(() => [
    {
      accessorKey: "name",
      header: () => <TableHeaderText title={t("Name")} />,
      enableSorting: false,
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

            {row.original.name}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: () => <TableHeaderText title={t("Email")} />,
      enableSorting: false,
      cell: ({ row }) => <p>{row.original.email}</p>,
    },
    {
      accessorKey: "subject",
      header: () => <TableHeaderText title={t("Subject")} />,
      enableSorting: false,
      cell: ({ row }) => <p>{row.original.subject}</p>,
    },
    {
      accessorKey: "message",
      header: () => <TableHeaderText title={t("Message")} />,
      enableSorting: false,
      cell: ({ row }) => <p>{row.original.message}</p>,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <TableHeaderSort column={column} title={t("Created At")} />
      ),
      enableSorting: true,
      cell: ({ row }) => <p>{row.original.created_at}</p>,
    },
  ], [t]);
}
