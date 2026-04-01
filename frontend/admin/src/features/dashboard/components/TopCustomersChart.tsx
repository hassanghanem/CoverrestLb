"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface TopCustomersChartProps {
  data: { id: number; name: string; total_spent: number; orders_count: number }[];
  isLoading: boolean;
}

export function TopCustomersChart({ data, isLoading }: TopCustomersChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Top customers")}</CardTitle>
          <CardDescription>{t("Customers with highest lifetime value")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
    spent: item.total_spent,
    orders: item.orders_count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Top customers")}</CardTitle>
        <CardDescription>{t("Customers with highest lifetime value")}</CardDescription>
      </CardHeader>
      <CardContent>
                     {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            {t("No data available")}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tickLine={false}
              axisLine={false}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "spent") return [`$${value}`, t("Total Spent")];
                if (name === "orders") return [value, t("Orders")];
                return [value, name];
              }}
            />
            <Bar
              dataKey="spent"
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