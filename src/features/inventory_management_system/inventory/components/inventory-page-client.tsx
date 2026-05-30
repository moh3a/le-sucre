"use client";

import { AlertTriangle, TrendingUpDown, Warehouse } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/components/providers/app-providers";
import { InventoryForecastTable } from "./inventory-forecast-table";
import { InventoryAlertsTable } from "./inventory-alerts-table";

export function InventoryPageClient() {
  const forecast = trpc.forecast.dashboard.useQuery({ page: 1, limit: 1 });
  const alerts = trpc.forecast.alerts.useQuery({ page: 1, limit: 1, status: "open" });
  const high_risk = trpc.forecast.dashboard.useQuery({ page: 1, limit: 1, risk_level: "high" });

  const loading = forecast.isLoading || alerts.isLoading || high_risk.isLoading;

  return (
    <ConsolePageShell
      title="Inventaire"
      subtitle="Stock, alertes et prévisions"
      stats={
        <StatsGrid
          loading={loading}
          items={[
            {
              label: "SKUs suivis",
              value: forecast.data?.rows.length ?? 0,
              icon: Warehouse,
              color: "info",
            },
            {
              label: "Alertes ouvertes",
              value: alerts.data?.length ?? 0,
              icon: AlertTriangle,
              color: "warning",
            },
            {
              label: "Risque élevé",
              value: high_risk.data?.rows.length ?? 0,
              icon: TrendingUpDown,
              color: "error",
            },
            { label: "Entrepôt", value: "default", icon: Warehouse, color: "default" },
          ]}
        />
      }
      tabs={
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Prévisions</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            <InventoryForecastTable />
          </TabsContent>
          <TabsContent value="alerts" className="mt-4">
            <InventoryAlertsTable />
          </TabsContent>
        </Tabs>
      }
    />
  );
}
