"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface RefundsTrendChartProps {
  data: { date: string; refunds_count: number; refund_amount: number }[];
  isLoading: boolean;
}

export function RefundsTrendChart({ data, isLoading }: RefundsTrendChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Refunds trend")}</CardTitle>
          <CardDescription>{t("Daily refund count and amount")}</CardDescription>
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
        <CardTitle>{t("Refunds trend")}</CardTitle>
        <CardDescription>{t("Daily refund count and amount")}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            {t("No data available")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  if (name === "refunds_count") return [value, t("Refunds")];
                  if (name === "refund_amount") return [`$${value}`, t("Refund Amount")];
                  return [value, name];
                }}
                labelFormatter={(label) => t("Date: {{date}}", { date: label })}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="refunds_count"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="refund_amount"
                stroke="var(--chart-4)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}