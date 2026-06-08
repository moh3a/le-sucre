"use client";

import { trpc } from "@/components/providers/app-providers";
import { AnalyticsLineChart } from "./analytics-line-chart";
import { AnalyticsKpiCards } from "./analytics-kpi-cards";
import { default_range } from "../helpers/default-range";

export function AnalyticsDashboardClient() {
  const { from, to } = default_range();
  const { data, isLoading } = trpc.analytics.overview.useQuery({ from, to });

  if (isLoading) return <p className="text-muted-foreground text-sm">Chargement…</p>;
  if (!data) return <p className="text-muted-foreground text-sm">Aucune donnée disponible.</p>;

  return (
    <div className="space-y-6">
      <AnalyticsKpiCards totals={data.totals} repeat={data.repeat} />
      <section className="rounded-lg border p-4">
        <h2 className="font-heading mb-4 text-lg">Revenus (30 jours)</h2>
        <AnalyticsLineChart
          data={data.series.map((r) => ({
            day_key: r.day_key,
            revenue: Number(r.revenue),
          }))}
          x_key="day_key"
          y_key="revenue"
        />
      </section>
    </div>
  );
}
