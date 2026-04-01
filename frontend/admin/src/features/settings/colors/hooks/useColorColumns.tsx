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
import { Color } from "@/types/api.interfaces";
import { SUPPORTED_LANGS } from "@/i18n";

type UseColorColumnsProps = {
  handleEdit: (color: Color) => void;
  handleDelete: (color: Color) => void;
};

export function useColorColumns({
  handleEdit,
  handleDelete,
}: UseColorColumnsProps): ColumnDef<Color>[] {
  const { t } = useTranslation();

  return useMemo<ColumnDef<Color>[]>(() => [
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
              <span className="font-semibold">{lang.toUpperCase()}:</span>{" "}
              <span>{row.original.name?.[lang] || "-"}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <TableHeaderSort column={column} title={t("Code")} />
      ),
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-6 h-6 rounded border"
            style={{ backgroundColor: row.original.code }}
          />
          <span>{row.original.code}</span>
        </div>
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
  ], [handleEdit, handleDelete, t]);
}
