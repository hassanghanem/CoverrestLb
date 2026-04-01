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
import { SUPPORTED_LANGS } from "@/i18n";
import { Page } from "@/types/api.interfaces";

type UsePageColumnsProps = {
  handleEdit: (page: Page) => void;
};

export function usePageColumns({
  handleEdit,
}: UsePageColumnsProps): ColumnDef<Page>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "slug",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Slug")} />
        ),
        enableSorting: true,
        cell: ({ row }) => <div>{row.original.slug}</div>,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <TableHeaderSort column={column} title={t("Title")} />
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col space-y-1">
            {SUPPORTED_LANGS.map((lang) => (
              <div key={lang}>
                <strong>{lang.toUpperCase()}:</strong>{" "}
                <span>{row.original.title?.[lang] || "-"}</span>
              </div>
            ))}
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
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, t]
  );
}
