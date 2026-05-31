"use client";

import { AlertTriangle, CheckCircle2, DollarSign, Package, ShoppingBag, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

export function ProductStats() {
  const t = useTranslations("products");
  const { data, isLoading } = trpc.products.adminStats.useQuery();

  return (
    <StatsGrid
      loading={isLoading}
      items={[
        { label: t("stats_total"), value: data?.total_products ?? 0, icon: Package, color: "info" },
        {
          label: t("stats_active"),
          value: data?.active_products ?? 0,
          icon: CheckCircle2,
          color: "success",
        },
        {
          label: t("stats_inactive"),
          value: data?.inactive_products ?? 0,
          icon: Package,
          color: "default",
        },
        {
          label: t("stats_revenue"),
          value: `${Number(data?.total_revenue ?? 0).toFixed(0)} DZD`,
          icon: DollarSign,
          color: "success",
        },
        {
          label: t("stats_units_sold"),
          value: data?.total_units_sold ?? 0,
          icon: ShoppingBag,
          color: "info",
        },
        {
          label: t("stats_avg_rating"),
          value: Number(data?.average_rating ?? 0).toFixed(1),
          icon: Star,
          color: "warning",
        },
        {
          label: t("stats_low_stock"),
          value: data?.low_stock_products ?? 0,
          icon: AlertTriangle,
          color: "error",
        },
      ]}
    />
  );
}
