import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
import { Category } from "@/types/api.interfaces";
import { Toggle } from "@/components/ui/toggle";
import { SUPPORTED_LANGS } from "@/i18n";
import { getText } from "@/utils/getText";

type UseCategoryColumnsProps = {
  handleEdit: (category: Category) => void;
  handleDelete: (category: Category) => void;
  handleToggleActive: (category: Category) => void;
};

export function useCategoryColumns({
  handleEdit,
  handleDelete,
  handleToggleActive,
}: UseCategoryColumnsProps): ColumnDef<Category>[] {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => [
      {
        id: "image",
        header: t("Image"),
        cell: ({ row }) => (
          <div className="flex justify-center items-center w-20 h-20 overflow-hidden rounded-lg border border-gray-200">
            <img
              src={row.original.image}
              alt={getText(row.original.name, i18n.language)}
              className="object-cover w-full h-full"
            />
          </div>
        ),
      },
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
        accessorKey: "arrangement",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Arrangement")} />
        ),
        enableSorting: true,
        cell: ({ row }) => <span>{row.original.arrangement}</span>,
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
              {row.original.is_active ? t("Active") : t("Inactive")}
            </Badge>
          </Toggle>
        ),
      },
      {
        id: "actions",
        header: t("Actions"),
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
    [handleEdit, handleDelete, handleToggleActive, t]
  );
}
