"use client";

import { AlertTriangle, Calendar, Package, ShieldAlert } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { ForecastTable } from "./forecast-table";

export function ForecastPageClient() {
  const { data: stats, error, isLoading: statsLoading } = trpc.forecast.forecastStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading, error }}>
      <ConsolePageShell
        title="Prévisions Stock"
        subtitle="Analyse des prévisions de demande et des niveaux de stock"
        stats={
          <StatsGrid
            loading={statsLoading}
            items={[
              { label: "Total SKUs", value: stats?.total ?? 0, icon: Package, color: "default" },
              {
                label: "Alertes ouvertes",
                value: stats?.open_alerts ?? 0,
                icon: ShieldAlert,
                color: (stats?.open_alerts ?? 0) > 0 ? "error" : "info",
              },
              {
                label: "Risque Critique",
                value: stats?.critical ?? 0,
                icon: AlertTriangle,
                color: (stats?.critical ?? 0) > 0 ? "error" : "default",
              },
              {
                label: "Risque Élevé",
                value: stats?.high ?? 0,
                icon: AlertTriangle,
                color: (stats?.high ?? 0) > 0 ? "warning" : "default",
              },
              {
                label: "Jours moyens avant rupture",
                value: stats?.avg_days_until_stockout != null ? `${stats.avg_days_until_stockout} j` : "—",
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
