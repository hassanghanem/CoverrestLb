// src/app/dashboard/components/SalesByCategoryChart.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesByCategoryChartProps {
  data: { category_id: number; product_category: string; total: number }[];
  isLoading: boolean;
}

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

export function SalesByCategoryChart({ data, isLoading }: SalesByCategoryChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Sales by category")}</CardTitle>
          <CardDescription>{t("Revenue distribution across categories")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.product_category,
    value: item.total,
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Sales by category")}</CardTitle>
        <CardDescription>{t("Revenue distribution across categories")}</CardDescription>
      </CardHeader>
      <CardContent>
                     {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            {t("No data available")}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`$${value}`, t("Revenue")]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}