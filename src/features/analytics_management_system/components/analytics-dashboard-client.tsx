"use client";

import { useEffect, useState } from "react";
import { AnalyticsLineChart } from "./analytics-line-chart";
import { AnalyticsKpiCards } from "./analytics-kpi-cards";

export function AnalyticsDashboardClient() {
  const [data, set_data] = useState<any>(null);

  useEffect(() => {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    fetch(`/api/admin/analytics/overview?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((j) => set_data(j.data));
  }, []);

  if (!data) return <p>Chargement…</p>;

  return (
    <div className="space-y-6">
      <AnalyticsKpiCards totals={data.totals} repeat={data.repeat} />
      <section className="rounded-lg border p-4">
        <h2 className="mb-4 font-heading text-lg">Revenus (30 jours)</h2>
        <AnalyticsLineChart
          data={data.series.map((r: any) => ({
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