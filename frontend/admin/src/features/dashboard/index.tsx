"use client";

import { useTranslation } from "react-i18next";
import { Main } from "@/components/layout/main";
import { KpiCards } from "./components/KpiCards";
import { RevenueTrendChart } from "./components/RevenueTrendChart";
import { OrdersByDayChart } from "./components/OrdersByDayChart";
import { OrdersByStatusChart } from "./components/OrdersByStatusChart";
import { RefundsTrendChart } from "./components/RefundsTrendChart";
import { TopProductsChart } from "./components/TopProductsChart";
import { SalesByCategoryChart } from "./components/SalesByCategoryChart";
import { TopCustomersChart } from "./components/TopCustomersChart";
import { CouponUsageChart } from "./components/CouponUsageChart";
import { SessionsByDeviceChart } from "./components/SessionsByDeviceChart";
import { NewVsReturningChart } from "./components/NewVsReturningChart";
import { useDashboardLogic } from "./hooks/useDashboardLogic";
import { useDashboardVisibility } from "./hooks/useDashboardVisibility";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

const CHART_CONFIG = {
  revenueByDay: { category: "sales", importance: "high" },
  ordersByDay: { category: "sales", importance: "high" },
  ordersByStatus: { category: "operations", importance: "medium" },
  refundsByDay: { category: "finance", importance: "medium" },
  topProducts: { category: "products", importance: "high" },
  salesByCategory: { category: "products", importance: "high" },
  topCustomers: { category: "customers", importance: "medium" },
  couponUsage: { category: "marketing", importance: "low" },
  sessionsByDevice: { category: "analytics", importance: "medium" },
  newVsReturning: { category: "customers", importance: "high" },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { kpis, charts, isLoading, isError, refetch } = useDashboardLogic();
  const {
    visibleKpis,
    visibleCharts,
    toggleKpi,
    toggleChart,
    resetToDefaults,
    showAll,
    hideAll,
  } = useDashboardVisibility();

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-96 p-6">
        <div className="text-red-500 text-center space-y-2">
          <h3 className="text-lg font-semibold">
            {t("Dashboard retrieval failed")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("Please try refreshing the page")}
          </p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <Main>
      <div className="space-y-6  mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Visibility Manager */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <span>📊</span>
                  {t("Manage Visibility")}
                  <Badge variant="secondary">
                    {Object.entries(visibleCharts)
                      .filter(([key, isVisible]) =>
                        CHART_CONFIG[key as keyof typeof CHART_CONFIG] &&
                        isVisible
                      ).length}{" "}
                    {t("charts")}
                  </Badge>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 sm:w-96 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold">{t("Dashboard Visibility")}</h4>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="outline" size="sm" onClick={showAll}>
                        {t("All")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetToDefaults}>
                        {t("Defaults")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={hideAll}>
                        {t("None")}
                      </Button>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div>
                    <h5 className="font-medium mb-2">{t("KPIs")}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(visibleKpis).map(([key, isVisible]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`kpi-${key}`}
                            checked={isVisible}
                            onCheckedChange={() =>
                              toggleKpi(key as keyof typeof visibleKpis)
                            }
                          />
                          <label
                            htmlFor={`kpi-${key}`}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {t(key.replace(/([A-Z])/g, " $1").toLowerCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Charts */}
                  <div>
                    <h5 className="font-medium mb-2">{t("Charts")}</h5>
                    <div className="space-y-2">
                      {Object.entries(visibleCharts)
                        .filter(([key]) =>
                          CHART_CONFIG[key as keyof typeof CHART_CONFIG]
                        )
                        .map(([key, isVisible]) => {
                          const config =
                            CHART_CONFIG[key as keyof typeof CHART_CONFIG];
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between flex-wrap gap-1"
                            >
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`chart-${key}`}
                                  checked={isVisible}
                                  onCheckedChange={() =>
                                    toggleChart(key as keyof typeof visibleCharts)
                                  }
                                />
                                <label
                                  htmlFor={`chart-${key}`}
                                  className="text-sm capitalize cursor-pointer"
                                >
                                  {t(
                                    key.replace(/([A-Z])/g, " $1").toLowerCase()
                                  )}
                                </label>
                              </div>
                              {config && (
                                <Badge
                                  variant={
                                    config.importance === "high"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {t(config.importance)}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("Refresh")}
            </Button>
          </div>

          {/* Chart count */}
          <Badge variant="outline" className="text-xs self-end sm:self-auto">
            {Object.entries(visibleCharts)
              .filter(([key, isVisible]) =>
                CHART_CONFIG[key as keyof typeof CHART_CONFIG] && isVisible
              ).length} {t("of")} {" "}
            {Object.keys(CHART_CONFIG).length} {t("charts visible")}
          </Badge>
        </div>

        {/* KPI Cards */}
        <KpiCards
          kpis={kpis}
          isLoading={isLoading}
          growthRate={kpis.growthRate}
          visibleKpis={visibleKpis}
        />

        {/* Chart Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          {Object.entries(visibleCharts)
            .filter(([key]) => CHART_CONFIG[key as keyof typeof CHART_CONFIG])
            .map(([key, isVisible]) => {
              if (!isVisible) return null;

            const chartComponents = {
              revenueByDay: (
                <RevenueTrendChart data={charts.revenueByDay} isLoading={isLoading} />
              ),
              ordersByDay: (
                <OrdersByDayChart data={charts.ordersByDay} isLoading={isLoading} />
              ),
              ordersByStatus: (
                <OrdersByStatusChart data={charts.ordersByStatus} isLoading={isLoading} />
              ),
              refundsByDay: (
                <RefundsTrendChart data={charts.refundsByDay} isLoading={isLoading} />
              ),
              topProducts: (
                <TopProductsChart data={charts.topProducts} isLoading={isLoading} />
              ),
              salesByCategory: (
                <SalesByCategoryChart data={charts.salesByCategory} isLoading={isLoading} />
              ),
              topCustomers: (
                <TopCustomersChart data={charts.topCustomers} isLoading={isLoading} />
              ),
              couponUsage: (
                <CouponUsageChart data={charts.couponUsage} isLoading={isLoading} />
              ),
              sessionsByDevice: (
                <SessionsByDeviceChart data={charts.sessionsByDevice} isLoading={isLoading} />
              ),
              newVsReturning: (
                <NewVsReturningChart data={charts.newVsReturning} isLoading={isLoading} />
              ),
            };

            const chartComponent =
              chartComponents[key as keyof typeof chartComponents];

            return chartComponent ? <div key={key}>{chartComponent}</div> : null;
          })}
        </div>
      </div>
    </Main>
  );
}
