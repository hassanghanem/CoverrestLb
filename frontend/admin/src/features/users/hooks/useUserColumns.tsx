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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { User } from "@/types/api.interfaces";

type UseUserColumnsProps = {
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleToggleActive: (user: User) => void;
};

export function useUserColumns({
  handleEdit,
  handleDelete,
  handleToggleActive
}: UseUserColumnsProps): ColumnDef<User>[] {
  const { t } = useTranslation();

  return useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Name")} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => rowA.original.name.localeCompare(rowB.original.name),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback>{user?.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {user.name}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Email")} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => rowA.original.email.localeCompare(rowB.original.email),
      cell: ({ row }) => <p className="font-medium">{row.original.email}</p>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Role")} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => rowA.original.role.localeCompare(rowB.original.role),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>;
      },
    },
    {
      accessorKey: "last_activity",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Last Activity")} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.sessions.find(s => s.is_current_device)?.last_activity;
        const b = rowB.original.sessions.find(s => s.is_current_device)?.last_activity;
        return (new Date(a || 0).getTime()) - (new Date(b || 0).getTime());
      },
      cell: ({ row }) => {
        const currentSession = row.original.sessions.find(s => s.is_current_device);
        return currentSession?.last_activity_human || t("N/A");
      },
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Is Active")} />,
      enableSorting: true,
      sortingFn: (rowA, rowB) => rowA.original.email.localeCompare(rowB.original.email),
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
              <span className="sr-only">{t("Open menu")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>{t("Edit user")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original)} className="text-red-600 focus:text-red-600">
              {t("Delete user")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [handleEdit, handleDelete, handleToggleActive, t]);
}
