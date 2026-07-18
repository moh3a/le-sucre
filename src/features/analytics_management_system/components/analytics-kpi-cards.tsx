"use client";

import {
  DollarSign,
  ReceiptCent,
  Repeat,
  TrendingUp,
  ShoppingCart,
  Users,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { StatsGrid } from "@/components/console/stats-grid";
import type { IAnalyticsOverview } from "../types";

export function AnalyticsKpiCards({
  totals,
  repeat,
  funnel,
}: {
  totals: IAnalyticsOverview["totals"];
  repeat: IAnalyticsOverview["repeat"];
  funnel: IAnalyticsOverview["funnel"];
}) {
  const t = useTranslations("analytics");

  const viewSessions = funnel.find((s) => s.step === "view")?.sessions ?? 0;
  const avgOrderValue =
    totals.orders > 0 ? Number(totals.revenue) / totals.orders : 0;

  return (
    <StatsGrid
      items={[
        {
          label: t("kpi_revenue_label"),
          value: `${Number(totals.revenue ?? 0).toLocaleString("fr-DZ", { maximumFractionDigits: 0 })} DZD`,
          description: t("kpi_revenue_desc"),
          icon: DollarSign,
          color: "success",
        },
        {
          label: t("kpi_orders_label"),
          value: totals.orders ?? 0,
          description: t("kpi_orders_desc"),
          icon: ReceiptCent,
          color: "info",
        },
        {
          label: t("kpi_aov_label"),
          value: `${avgOrderValue.toLocaleString("fr-DZ", { maximumFractionDigits: 0 })} DZD`,
          description: t("kpi_aov_desc"),
          icon: ShoppingCart,
          color: "info",
        },
        {
          label: t("kpi_conversion_label"),
          value: `${((totals.avg_conversion ?? 0) * 100).toFixed(1)}%`,
          description: t("kpi_conversion_desc"),
          icon: TrendingUp,
          color: "warning",
        },
        {
          label: t("kpi_abandoned_label"),
          value: totals.abandoned_carts ?? 0,
          description: t("kpi_abandoned_desc"),
          icon: AlertTriangle,
          color: "error",
        },
        {
          label: t("kpi_repeat_label"),
          value: `${((repeat.repeat_rate ?? 0) * 100).toFixed(1)}%`,
          description: t("kpi_repeat_desc"),
          icon: Repeat,
          color: "default",
        },
        {
          label: t("kpi_repeat_customers_label"),
          value: repeat.repeat_customers ?? 0,
          description: t("kpi_repeat_customers_desc"),
          icon: Users,
          color: "default",
        },
        {
          label: t("kpi_visitors_label"),
          value: viewSessions.toLocaleString("fr-FR"),
          description: t("kpi_visitors_desc"),
          icon: Eye,
          color: "info",
        },
      ]}
    />
  );
}
