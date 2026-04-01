"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersByDayChartProps {
  data: { date: string; orders_count: number; avg_order_value: number }[];
  isLoading: boolean;
}

export function OrdersByDayChart({ data, isLoading }: OrdersByDayChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Orders by day")}</CardTitle>
          <CardDescription>{t("Daily order count and average value")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Orders by day")}</CardTitle>
        <CardDescription>{t("Daily order count and average value")}</CardDescription>
      </CardHeader>
      <CardContent>
                     {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            {t("No data available")}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "orders_count") return [value, t("Orders")];
                if (name === "avg_order_value") return [`$${value}`, t("Avg Order Value")];
                return [value, name];
              }}
              labelFormatter={(label) => t("Date: {{date}}", { date: label })}
            />
            <Bar
              dataKey="orders_count"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}