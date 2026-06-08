"use client";

import { useMemo } from "react";
import { trpc } from "@/components/providers/app-providers";
import { AnalyticsLineChart } from "@/features/analytics_management_system/components/analytics-line-chart";

export function ProductAnalyticsPanel({ product_id }: { product_id: string }) {
  const range = useMemo(() => {
    return {
      from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    };
  }, []);

  const { data, isLoading } = trpc.analytics.productDetail.useQuery(
    {
      product_id,
      ...range,
    },
    {
      enabled: !!range.to && !!range.from,
    },
  );

  if (isLoading) return <p>Chargement…</p>;
  if (!data) return <p>Aucune donnée</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">Revenu (30j)</p>
        <p className="text-2xl font-semibold">{data.totals.revenue} DZD</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-xs">Vues · Panier · Conversion</p>
        <p className="text-2xl font-semibold">
          {data.totals.views} · {data.totals.add_to_cart} ·{" "}
          {(data.totals.avg_conversion * 100).toFixed(1)}%
        </p>
      </div>
      <div className="rounded-lg border p-4 lg:col-span-2">
        <h3 className="mb-2 font-medium">Revenus journaliers</h3>
        <AnalyticsLineChart data={data.daily_series} x_key="day_key" y_key="revenue" />
      </div>
    </div>
  );
}
