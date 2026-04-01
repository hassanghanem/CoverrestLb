"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface TopProduct {
  id: number;
  name: string;
  net_quantity: number;
  gross_revenue: number;
}

interface TopProductsChartProps {
  data?: TopProduct[];
  isLoading: boolean;
}

export function TopProductsChart({ data, }: TopProductsChartProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Top Products")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            {t("No data available")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="net_quantity" fill="var(--chart-1)" name={t("Quantity Sold")} />
              <Bar dataKey="gross_revenue" fill="var(--chart-2)" name={t("Revenue")} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
