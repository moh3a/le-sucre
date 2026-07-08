"use client";

import { useTranslations } from "next-intl";
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid, Tooltip } from "recharts";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <LineChart width={400} height={300} data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#c8d152" />
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("order_growth_chart")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={400} height={300} data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#700145" />
          </LineChart>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("status_distribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart width={800} height={300} data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <Tooltip />
            <Bar dataKey="count" fill="#4d4c20" />
          </BarChart>
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}
