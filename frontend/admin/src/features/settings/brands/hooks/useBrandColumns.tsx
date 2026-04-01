import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Brand } from "@/types/api.interfaces";
import { Toggle } from "@/components/ui/toggle";

type UseBrandColumnsProps = {
  handleEdit: (brand: Brand) => void;
  handleDelete: (brand: Brand) => void;
  handleToggleActive: (brand: Brand) => void;
};

export function useBrandColumns({ handleEdit, handleDelete, handleToggleActive }: UseBrandColumnsProps): ColumnDef<Brand>[] {
  const { t } = useTranslation();

  return useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Name")} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          <div className="">
            <span className="">{row.original.name}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <TableHeaderSort column={column} title={t("Is Active")} />
      ),
      enableSorting: true,

      cell: ({ row }) => (
        <Toggle onClick={() => handleToggleActive(row.original)}>


          <Badge variant={row.original.is_active ? "default" : "destructive"}>
            {row.original.is_active
              ? t("Active")
              : t("Inactive")}
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
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
              {t("Delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [handleEdit, handleDelete, handleToggleActive, t]);
}
