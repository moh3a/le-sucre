"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { AnalyticsKpiCards } from "./analytics-kpi-cards";
import { default_range } from "../helpers/default-range";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";

export function AnalyticsDashboardClient() {
  const t = useTranslations("analytics");
  const { from, to } = default_range();
  const { data, isLoading } = trpc.analytics.overview.useQuery({ from, to });

  if (!data) return <p className="text-muted-foreground text-sm">{t("no_data")}</p>;

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={<p className="text-muted-foreground text-sm">{t("loading")}</p>}
    >
      <Card>
      <CardHeader>
        <CardTitle>{t("overview_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnalyticsKpiCards totals={data.totals} repeat={data.repeat} funnel={data.funnel} />
        <LineChart
          title={t("revenue_30_days")}
          description={t("revenue_description")}
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
