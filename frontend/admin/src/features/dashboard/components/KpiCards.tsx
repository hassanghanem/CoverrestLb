// src/app/dashboard/components/KpiCards.tsx
"use client";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  RotateCcw,
  Package,
  Clock,
  UserCheck,
  UserPlus,
  Target,
  BarChart3,
  ShoppingBag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { KpiVisibility } from "../hooks/useDashboardVisibility";

interface KpiCardsProps {
 kpis: {
    totalRevenue: number;
    monthlyRevenue: number;
    avgOrderValue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    abandonedCarts: number;
    activeClients: number;
    totalClients: number;
    repeatCustomers: number;
    newCustomersThisMonth: number;
    returnsRate: number;
    totalRefundsAmount: number;
    totalReturnOrders: number;
    avgRefundPerReturn: number;
    inventoryValue: number;
    lowStockCount: number;
    avgFulfillmentDays: number | null; // Change this line
    totalSessions: number;
    conversionRate: number;
    growthRate: number;
  };
  isLoading: boolean;
  growthRate: number;
  visibleKpis: KpiVisibility;
}

export function KpiCards({ kpis, isLoading, growthRate, visibleKpis }: KpiCardsProps) {
  const { t } = useTranslation();

  const growthColor = growthRate >= 0 ? "text-green-600" : "text-red-600";
  const growthSymbol = growthRate >= 0 ? "↗" : "↘";

  const kpiList = [
    // Revenue KPIs
    {
      key: "totalRevenue" as const,
      title: t("Total Revenue"),
      value: `$${kpis.totalRevenue?.toLocaleString() || '0'}`,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("All time"),
      color: "var(--chart-1)",
    },
    {
      key: "monthlyRevenue" as const,
      title: t("Monthly Revenue"),
      value: `$${kpis.monthlyRevenue?.toLocaleString() || '0'}`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      subtitle: (
        <span className={growthColor}>
          {growthSymbol} {Math.abs(growthRate).toFixed(1)}% {t("vs last month")}
        </span>
      ),
      color: "var(--chart-2)",
    },
    {
      key: "avgOrderValue" as const,
      title: t("Avg Order Value"),
      value: `$${kpis.avgOrderValue?.toLocaleString() || '0'}`,
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Monthly average"),
      color: "var(--chart-3)",
    },

    // Order KPIs
    {
      key: "totalOrders" as const,
      title: t("Total Orders"),
      value: kpis.totalOrders?.toLocaleString() || '0',
      icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />,
      subtitle: `${kpis.completedOrders || 0} ${t("completed")} • ${kpis.pendingOrders || 0} ${t("pending")}`,
      color: "var(--chart-4)",
    },
    {
      key: "abandonedCarts" as const,
      title: t("Abandoned Carts"),
      value: kpis.abandonedCarts?.toLocaleString() || '0',
      icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Last 30 days"),
      color: "var(--chart-5)",
    },

    // Customer KPIs
    {
      key: "activeClients" as const,
      title: t("Active Clients"),
      value: kpis.activeClients?.toLocaleString() || '0',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      subtitle: `${kpis.conversionRate || 0}% ${t("conversion rate")}`,
      color: "var(--chart-1)",
    },
    {
      key: "totalClients" as const,
      title: t("Total Clients"),
      value: kpis.totalClients?.toLocaleString() || '0',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      subtitle: `${kpis.activeClients || 0} ${t("active")}`,
      color: "var(--chart-2)",
    },
    {
      key: "repeatCustomers" as const,
      title: t("Repeat Customers"),
      value: kpis.repeatCustomers?.toLocaleString() || '0',
      icon: <UserCheck className="h-4 w-4 text-muted-foreground" />,
      subtitle: `${kpis.newCustomersThisMonth || 0} ${t("new this month")}`,
      color: "var(--chart-3)",
    },
    {
      key: "newCustomersThisMonth" as const,
      title: t("New Customers"),
      value: kpis.newCustomersThisMonth?.toLocaleString() || '0',
      icon: <UserPlus className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("This month"),
      color: "var(--chart-4)",
    },

    // Return / Refund KPIs
    {
      key: "returnsRate" as const,
      title: t("Returns Rate"),
      value: `${kpis.returnsRate || 0}%`,
      icon: <RotateCcw className="h-4 w-4 text-muted-foreground" />,
      subtitle: `${kpis.totalReturnOrders || 0} ${t("return orders")}`,
      color: "var(--chart-5)",
    },
    {
      key: "totalRefundsAmount" as const,
      title: t("Total Refunds"),
      value: `$${kpis.totalRefundsAmount?.toLocaleString() || '0'}`,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      subtitle: `$${kpis.avgRefundPerReturn || 0} ${t("avg per return")}`,
      color: "var(--chart-6)",
    },
    {
      key: "totalReturnOrders" as const,
      title: t("Return Orders"),
      value: kpis.totalReturnOrders?.toLocaleString() || '0',
      icon: <RotateCcw className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Approved returns"),
      color: "var(--chart-1)",
    },

    // Inventory KPIs
    {
      key: "inventoryValue" as const,
      title: t("Inventory Value"),
      value: `$${kpis.inventoryValue?.toLocaleString() || '0'}`,
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      subtitle: `${kpis.lowStockCount || 0} ${t("low stock items")}`,
      color: "var(--chart-2)",
    },
    {
      key: "lowStockCount" as const,
      title: t("Low Stock Items"),
      value: kpis.lowStockCount?.toLocaleString() || '0',
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Need restocking"),
      color: "var(--chart-3)",
    },

    // Performance KPIs
    {
      key: "avgFulfillmentDays" as const,
      title: t("Avg Fulfillment"),
      value: kpis.avgFulfillmentDays ? `${kpis.avgFulfillmentDays}d` : "N/A",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Delivery time"),
      color: "var(--chart-4)",
    },
    {
      key: "totalSessions" as const,
      title: t("Total Sessions"),
      value: kpis.totalSessions?.toLocaleString() || '0',
      icon: <Target className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Website visits"),
      color: "var(--chart-5)",
    },
    {
      key: "conversionRate" as const,
      title: t("Conversion Rate"),
      value: `${kpis.conversionRate || 0}%`,
      icon: <Target className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Client activation"),
      color: "var(--chart-6)",
    },
    {
      key: "growthRate" as const,
      title: t("Growth Rate"),
      value: `${growthRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      subtitle: t("Monthly revenue growth"),
      color: growthRate >= 0 ? "var(--chart-1)" : "var(--chart-5)",
    },
  ];

  // Filter visible KPIs and handle empty state
  const visibleKpiItems = kpiList.filter(item => visibleKpis[item.key]);

  if (visibleKpiItems.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No KPIs visible. Use the visibility manager to show some metrics.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visibleKpiItems.map((item) => (
        <Card key={item.key} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </div>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}