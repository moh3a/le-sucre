"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { AnalyticsKpiCards } from "./analytics-kpi-cards";
import { default_range } from "../helpers/default-range";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";

export function AnalyticsDashboardClient() {
  const { from, to } = default_range();
  const { data, isLoading } = trpc.analytics.overview.useQuery({ from, to });

  if (!data) return <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>;

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<p className="text-muted-foreground text-sm">Chargement…</p>}
    >
      <Card>
      <CardHeader>
        <CardTitle>Vue d&apos;ensemble</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnalyticsKpiCards totals={data.totals} repeat={data.repeat} />
        <LineChart
          title="Revenus (30 jours)"
          description="Revenus générés par les produits"
          data={data.series.map((r) => ({
            day_key: r.day_key,
            revenue: Number(r.revenue),
          }))}
          x_key="day_key"
          y_key="revenue"
        />
      </CardContent>
      </Card>
    </QueryGuard>
  );
}
