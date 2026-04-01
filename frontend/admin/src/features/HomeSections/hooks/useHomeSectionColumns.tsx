import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { HomeSection } from "@/types/api.interfaces";
import { useNavigate } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGS } from "@/i18n";

type UseHomeSectionColumnsProps = {
  handleDelete: (homeSection: HomeSection) => void;
  handleToggleActive: (homeSection: HomeSection) => void;
};

export function useHomeSectionColumns({ handleDelete, handleToggleActive }: UseHomeSectionColumnsProps): ColumnDef<HomeSection>[] {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Title")} />,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          {SUPPORTED_LANGS.map((lang) => (
            <div key={lang}>
              {lang.toUpperCase()}: <span>{row.original.title?.[lang]}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Type")} />,
      enableSorting: true,
      cell: ({ row }) => <span>{row.original.type}</span>,
    },
    {
      accessorKey: "arrangement",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Arrangement")} />,
      enableSorting: true,
      cell: ({ row }) => <span>{row.original.arrangement}</span>,
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
            <DropdownMenuItem onClick={() => navigate(`/home-sections/${row.original.id}/edit`)}>
              {t("Edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
              {t("Delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [handleDelete, handleToggleActive, t]);
}
