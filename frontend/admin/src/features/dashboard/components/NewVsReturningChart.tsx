// src/app/dashboard/components/NewVsReturningChart.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface NewVsReturningChartProps {
  data: { new: number; returning: number };
  isLoading: boolean;
}

const CUSTOMER_COLORS = {
  new: "var(--chart-1)",
  returning: "var(--chart-2)",
};

export function NewVsReturningChart({ data, isLoading }: NewVsReturningChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("New vs returning customers")}</CardTitle>
          <CardDescription>{t("Customer acquisition and retention")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: t("New customers"), value: data.new, fill: CUSTOMER_COLORS.new },
    { name: t("Returning customers"), value: data.returning, fill: CUSTOMER_COLORS.returning },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("New vs returning customers")}</CardTitle>
        <CardDescription>{t("Customer acquisition and retention")}</CardDescription>
      </CardHeader>
      <CardContent>
             {data.new === 0 && data.returning === 0 ? (
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
              formatter={(value) => [value, t("Customers")]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}