"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Calendar, Package, ShieldAlert } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { ForecastTable } from "./forecast-table";

export function ForecastPageClient() {
  const t = useTranslations("forecast");
  const { data: stats, error, isLoading: statsLoading } = trpc.forecast.forecastStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading, error }}>
      <ConsolePageShell
        title={t("sku_code_column")}
        subtitle={t("search_placeholder")}
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: t("product_column"), value: stats?.total ?? 0, icon: Package, color: "default" },
              {
                label: t("alert_type_title"),
                value: stats?.open_alerts ?? 0,
                icon: ShieldAlert,
                color: (stats?.open_alerts ?? 0) > 0 ? "error" : "info",
              },
              {
                label: t("risk_critical"),
                value: stats?.critical ?? 0,
                icon: AlertTriangle,
                color: (stats?.critical ?? 0) > 0 ? "error" : "default",
              },
              {
                label: t("risk_high"),
                value: stats?.high ?? 0,
                icon: AlertTriangle,
                color: (stats?.high ?? 0) > 0 ? "warning" : "default",
              },
              {
                label: t("days_remaining_column"),
                value: stats?.avg_days_until_stockout != null ? `${stats.avg_days_until_stockout} ${t("days_remaining_column")}` : "—",
                icon: Calendar,
                color: (stats?.avg_days_until_stockout ?? 99) < 15 ? "error" : (stats?.avg_days_until_stockout ?? 99) < 30 ? "warning" : "default",
              },
            ]}
          />
        }
      >
        <ForecastTable />
      </ConsolePageShell>
    </QueryGuard>
  );
}
