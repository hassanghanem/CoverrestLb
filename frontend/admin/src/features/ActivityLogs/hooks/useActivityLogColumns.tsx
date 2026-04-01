import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ActivityLog } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { TableHeaderSort } from "@/components/datatable/table-header-sort";
import { TableHeaderText } from "@/components/datatable/table-header-text";
import { getDeviceIcon } from "@/components/public/getDeviceIcon";

export function useActivityLogColumns(): ColumnDef<ActivityLog>[] {
  const { t } = useTranslation();

  return useMemo<ColumnDef<ActivityLog>[]>(() => [
    {
      accessorKey: "causer_name",
      header: () => <TableHeaderText title={t("User Name")} />,
      enableSorting: false,
      cell: ({ row }) => <p>{row.original.causer_name}</p>,
    },
    {
      accessorKey: "log_name",
      header: () => <TableHeaderText title={t("Log Name")} />,
      enableSorting: false,
      cell: ({ row }) => <p>{row.original.log_name}</p>,
    },
    {
      accessorKey: "description",
      header: () => <TableHeaderText title={t("Description")} />,
      enableSorting: false,
      cell: ({ row }) => <p>{row.original.description}</p>,
    },
    {
      accessorKey: "properties",
      header: () => <TableHeaderText title={t("Changes")} />,
      enableSorting: false,
      cell: ({ row }) => {
        const { properties } = row.original;

        if (properties?.session && typeof properties.session === "object") {
          const session = properties.session;
          const {
            ip,
            email,
            location,
            is_robot,
            is_mobile,
            is_tablet,
            is_desktop,
            device,
            browser,
            platform,
            password
          } = session;

          return (
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                {getDeviceIcon(device, is_mobile, is_tablet, is_desktop)}
                <span className="font-medium">{email}</span>
                {is_robot && (
                  <span className="text-xs text-yellow-500 bg-yellow-100 px-2 py-0.5 rounded">
                    {t("Bot")}
                  </span>
                )}
              </div>
              {password && password.trim() !== "" && (
                <p>
                  <strong>{t("Password")}:</strong> {password}
                </p>
              )}
              <p>
                <strong>{t("IP")}:</strong> {ip}
              </p>
              <p>
                <strong>{t("Location")}:</strong>{" "}
                {typeof location === "object" && location !== null
                  ? `${location.lat}, ${location.lon}`
                  : location || t("Unknown")}
              </p>
              <p>
                <strong>{t("Device")}:</strong> {device || t("Unknown")} / {browser || t("Unknown")} / {platform || t("Unknown")}
              </p>
            </div>
          );
        }

        // Legacy-style logs
        const oldValues = properties?.old || {};
        const newValues = properties?.attributes || {};
        const hasStructuredProps = Object.keys(oldValues).length > 0 || Object.keys(newValues).length > 0;

        if (!hasStructuredProps && properties && typeof properties === "object") {
          const flatKeys = Object.keys(properties);
          return (
            <ul className="text-sm space-y-1">
              {flatKeys.map((key) => (
                <li key={key}>
                  <strong>{key}:</strong>{" "}
                  <span>{typeof properties[key] === "object"
                    ? JSON.stringify(properties[key], null, 2)
                    : properties[key]}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Structured attribute diff
        const allKeys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]));
        const changedKeys = allKeys.filter(
          key => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
        );

        if (changedKeys.length === 0) {
          return <p className="text-muted-foreground">{t("No changes")}</p>;
        }

        const formatValue = (value: any) =>
          typeof value === "object" && value !== null
            ? <pre className="inline text-xs">{JSON.stringify(value, null, 2)}</pre>
            : value ?? t("null");

        return (
          <ul className="text-sm space-y-1">
            {changedKeys.map((key) => (
              <li key={key}>
                <strong>{key}:</strong>{" "}
                <span className="line-through text-red-500">{formatValue(oldValues[key])}</span>{" "}
                → <span className="text-green-600">{formatValue(newValues[key])}</span>
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <TableHeaderSort column={column} title={t("Created At")} />,
      enableSorting: true,
      cell: ({ row }) => <p>{row.original.created_at}</p>,
    },
  ], [t]);
}
