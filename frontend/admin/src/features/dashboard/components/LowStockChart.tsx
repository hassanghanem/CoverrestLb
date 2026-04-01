// src/app/dashboard/components/LowStockChart.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface LowStockChartProps {
  data?: { variant_id: number; sku: string | null; product_name: string; available_qty: number; price: number; inventory_value: number }[] | null;
  isLoading: boolean;
}

export function LowStockChart({ data, isLoading }: LowStockChartProps) {
  const { t } = useTranslation();

  const safeData = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Low stock alert")}</CardTitle>
          <CardDescription>{t("Products with critically low inventory")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [...safeData]
    .sort((a, b) => a.available_qty - b.available_qty || a.product_name.localeCompare(b.product_name))
    .map(item => {
    const baseLabel = item.sku || item.product_name;
    const label =
      baseLabel.length > 30 ? `${baseLabel.substring(0, 30)}...` : baseLabel;

    return {
      ...item,
      label,
      quantity: item.available_qty,
      value: item.inventory_value,
    };
  });

  const barHeight = 28;
  const chartHeight = Math.min(700, Math.max(240, chartData.length * barHeight));

  if (safeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {t("Low stock alert")}
          </CardTitle>
          <CardDescription>{t("Products with critically low inventory")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {t("No low stock items")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {t("Low stock alert")}
          </CardTitle>
          <CardDescription>{t("Products with critically low inventory")}</CardDescription>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{t("Sorted by lowest quantity first")}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                <span>{t("Out of stock")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                <span>{t("Very low (1-2)")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                <span>{t("Low (3-5)")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {safeData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            {t("No data available")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 180, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
              <XAxis type="number" tickMargin={8} />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={180}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "quantity") return [value, t("Quantity")];
                  if (name === "value") return [`$${value}`, t("Inventory Value")];
                  return [value, name];
                }}
                labelFormatter={(_, payload) => {
                  const item = payload && payload[0]?.payload;
                  if (!item) return "";
                  if (item.sku) {
                    return `${item.sku} – ${item.product_name}`;
                  }
                  return item.product_name;
                }}
              />
              <Bar
                dataKey="quantity"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry) => {
                  let color = "var(--chart-5)";
                  if (entry.available_qty <= 0) {
                    color = "#ef4444"; // red
                  } else if (entry.available_qty <= 2) {
                    color = "#fb923c"; // orange
                  } else if (entry.available_qty <= 5) {
                    color = "#facc15"; // yellow
                  }

                  return (
                    <Cell key={entry.variant_id} fill={color} />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}