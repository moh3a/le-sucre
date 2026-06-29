"use client";

import { DollarSign, ReceiptCent, Repeat, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatsGrid } from "@/components/console/stats-grid";

export function AnalyticsKpiCards({
  totals,
  repeat,
}: {
  totals?: { revenue?: string; orders?: number; avg_conversion?: number; abandoned_carts?: number };
  repeat?: { repeat_rate?: number; repeat_customers?: number };
}) {
  const t = useTranslations("analytics");
  return (
    <StatsGrid
      items={[
        {
          label: t("kpi_revenue_label"),
          value: `${Number(totals?.revenue ?? 0).toLocaleString("fr-DZ", { maximumFractionDigits: 0 })} DZD`,
          description: t("kpi_revenue_desc"),
          icon: DollarSign,
          color: "success",
        },
        {
          label: t("kpi_orders_label"),
          value: totals?.orders ?? 0,
          description: t("kpi_orders_desc"),
          icon: ReceiptCent,
          color: "info",
        },
        {
          label: t("kpi_conversion_label"),
          value: `${((totals?.avg_conversion ?? 0) * 100).toFixed(1)}%`,
          description: t("kpi_conversion_desc"),
          icon: TrendingUp,
          color: "warning",
        },
        {
          label: t("kpi_repeat_label"),
          value: repeat?.repeat_customers ?? 0,
          description: t("kpi_repeat_desc"),
          icon: Repeat,
          color: "default",
        },
      ]}
    />
  );
}
