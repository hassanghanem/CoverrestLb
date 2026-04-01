import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Package, Truck, XCircle, PauseCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface OrderStatusMetadata {
  label: string;
  className: string;
  icon: LucideIcon;
}

const STATUS_METADATA: Record<string, OrderStatusMetadata> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    icon: Package,
  },
  "on hold": {
    label: "On Hold",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    icon: PauseCircle,
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: XCircle,
  },
  "cancelled by admin": {
    label: "Cancelled By Admin",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: XCircle,
  },
  "cancelled by customer": {
    label: "Cancelled By Customer",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: XCircle,
  },
  returned: {
    label: "Returned",
    className: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    icon: Package,
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: CheckCircle,
  },
};

const formatStatusLabel = (status: string) =>
  status
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export const getOrderStatusMetadata = (status: string, t: (key: string) => string): OrderStatusMetadata => {
  const normalized = status.toLowerCase();
  const metadata = STATUS_METADATA[normalized];

  if (metadata) return { ...metadata, label: t(metadata.label) };

  // fallback for unknown statuses
  return {
    label: t(formatStatusLabel(status)),
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    icon: Clock,
  };
};

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();
  const metadata = getOrderStatusMetadata(status, t);
  const Icon = metadata.icon;

  return (
    <Badge className={cn(metadata.className, className)}>
      <span className="flex items-center gap-1">
        <Icon className="h-4 w-4" />
        {metadata.label}
      </span>
    </Badge>
  );
};
