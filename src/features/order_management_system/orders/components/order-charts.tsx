"use client";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart } from "recharts";

export function OrderCharts() {
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
          <CardTitle>Croissance des revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={revenueData}
            xKey="date"
            lines={[{ key: "revenue", name: "Revenus", color: "#c8d152" }]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Croissance des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={revenueData}
            xKey="date"
            lines={[{ key: "orders", name: "Commandes", color: "#700145" }]}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Répartition des statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={statusData}
            xKey="status"
            bars={[{ key: "count", name: "Nombre", color: "#4d4c20" }]}
          />
        </CardContent>
      </Card>
    </div>
    </QueryGuard>
  );
}
