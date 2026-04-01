"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

interface OrdersByStatusChartProps {
  data: {
    status: {
      name: string;
      description?: string;
      color?: string;
      class?: string;
    };
    count: number;
  }[];
  isLoading: boolean;
}



export function OrdersByStatusChart({ data, isLoading }: OrdersByStatusChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Orders by status")}</CardTitle>
          <CardDescription>{t("Distribution of orders by status")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // ✅ Normalize data for Recharts
  const chartData = data.map((item,) => ({
    name: item.status.name,
    value: item.count,
    description: item.status.description,
    fill: item.status.color , 
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{t("Orders by status")}</CardTitle>
        <CardDescription>{t("Distribution of orders by status")}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
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
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _, props) => [
                  `${value} ${t("Orders")}`,
                  props.payload?.name,
                ]}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
