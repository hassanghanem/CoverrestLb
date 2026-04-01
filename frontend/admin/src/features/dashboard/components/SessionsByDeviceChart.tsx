"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionsByDeviceChartProps {
  data: { device: string; count: number }[];
  isLoading: boolean;
}

const DEVICE_COLORS = {
  mobile: "var(--chart-1)",
  desktop: "var(--chart-2)",
  other: "var(--chart-3)",
};

export function SessionsByDeviceChart({ data, isLoading }: SessionsByDeviceChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Sessions by device")}</CardTitle>
          <CardDescription>{t("Website traffic by device type")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: t(item.device.charAt(0).toUpperCase() + item.device.slice(1)),
    value: item.count,
    fill: DEVICE_COLORS[item.device as keyof typeof DEVICE_COLORS] || "var(--chart-4)",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Sessions by device")}</CardTitle>
        <CardDescription>{t("Website traffic by device type")}</CardDescription>
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
                formatter={(value) => [value, t("Sessions")]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}