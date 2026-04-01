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
import { Tag } from "@/types/api.interfaces";

type UseTagColumnsProps = {
  handleEdit: (tag: Tag) => void;
  handleDelete: (tag: Tag) => void;
};

export function useTagColumns({ handleEdit, handleDelete }: UseTagColumnsProps): ColumnDef<Tag>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <TableHeaderSort column={column} title={t("Name")} />,
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.name}</span>,
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
              <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
                {t("Delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDelete, t]
  );
}
