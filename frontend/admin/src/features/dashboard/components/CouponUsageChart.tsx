"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface CouponUsageChartProps {
  data: { id: number; code: string; uses: number; revenue: number }[];
  isLoading: boolean;
}

export function CouponUsageChart({ data, isLoading }: CouponUsageChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Coupon usage")}</CardTitle>
          <CardDescription>{t("Most used coupons and generated revenue")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    code: item.code,
    uses: item.uses,
    revenue: item.revenue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Coupon usage")}</CardTitle>
        <CardDescription>{t("Most used coupons and generated revenue")}</CardDescription>
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
                dataKey="code"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                yAxisId="left"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "uses") return [value, t("Uses")];
                  if (name === "revenue") return [`$${value}`, t("Revenue")];
                  return [value, name];
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="uses"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}