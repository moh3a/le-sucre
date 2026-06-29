"use client";

import { useTranslations } from "next-intl";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart } from "recharts";

export function OrderCharts() {
  const t = useTranslations("orders");
  const { data, isLoading } = trpc.orders.adminCharts.useQuery();

  if (!data) return null;

  const revenueData = data.series.map((item) => ({
    date: item.day_key,
    revenue: Number(item.revenue),
    orders: Number(item.orders_count),
  }));

  const statusData = data.distribution.map((item) => ({
    status: item.status,
    count: Number(item.count),
  }));

  return (
    <QueryGuard query={{ isLoading }}>
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("revenue_growth")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={revenueData}
            xKey="date"
            lines={[{ key: "revenue", name: t("revenue"), color: "#c8d152" }]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("order_growth_chart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={revenueData}
            xKey="date"
            lines={[{ key: "orders", name: t("orders_chart"), color: "#700145" }]}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("status_distribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={statusData}
            xKey="status"
            bars={[{ key: "count", name: t("count"), color: "#4d4c20" }]}
          />
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}
