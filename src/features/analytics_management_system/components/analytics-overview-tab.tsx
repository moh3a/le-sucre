"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { DataTableSkeleton } from "@/features/data-table/components/data-table-skeleton";
import { AnalyticsKpiCards } from "./analytics-kpi-cards";
import { LineChart } from "@/components/ui/line-chart";

export function AnalyticsOverviewTab({ from, to }: { from: string; to: string }) {
  const t = useTranslations("analytics");
  const { data, isLoading } = trpc.analytics.overview.useQuery({ from, to });

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<DataTableSkeleton columnCount={4} rowCount={2} />}
    >
      {data && (
        <>
          <AnalyticsKpiCards
            totals={data.totals}
            repeat={data.repeat}
            funnel={data.funnel}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <LineChart
              title={t("revenue_trend")}
              description={t("revenue_trend_desc")}
              data={data.series.map((r) => ({
                day_key: r.day_key,
                revenue: Number(r.revenue),
              }))}
              x_key="day_key"
              y_key="revenue"
            />

            <LineChart
              title={t("orders_trend")}
              description={t("orders_trend_desc")}
              data={data.series.map((r) => ({
                day_key: r.day_key,
                orders: r.orders_count,
              }))}
              x_key="day_key"
              y_key="orders"
            />
          </div>
        </>
      )}
    </QueryGuard>
  );
}
