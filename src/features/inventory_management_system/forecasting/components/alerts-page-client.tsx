"use client";

import { parseAsString, useQueryState } from "nuqs";
import { AlertTriangle, Bell, BellOff, CheckCircle2, ShieldAlert } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/components/providers/app-providers";
import { AlertsTable } from "./alerts-table";

const TABS = [
  { value: "open", label: "Actives" },
  { value: "ack", label: "Pris acte" },
  { value: "resolved", label: "Résolues" },
];

export function AlertsPageClient() {
  const [status, setStatus] = useQueryState("alertStatus", parseAsString.withDefault("open"));

  const { data: stats, isLoading: statsLoading } = trpc.forecast.alertStats.useQuery();

  return (
    <ConsolePageShell
      title="Alertes Stock"
      subtitle="Gestion des alertes de stock et des prévisions de rupture"
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            { label: "Total alertes", value: stats?.total ?? 0, icon: Bell, color: "default" },
            { label: "Actives", value: stats?.open ?? 0, icon: ShieldAlert, color: "error" },
            { label: "Pris acte", value: stats?.ack ?? 0, icon: BellOff, color: "warning" },
            { label: "Résolues", value: stats?.resolved ?? 0, icon: CheckCircle2, color: "success" },
            { label: "Critiques", value: stats?.critical ?? 0, icon: AlertTriangle, color: "error" },
            { label: "Avertissements", value: stats?.warning ?? 0, icon: AlertTriangle, color: "warning" },
          ]}
        />
      }
    >
      <Tabs value={status} onValueChange={setStatus} className="space-y-6">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <AlertsTable status={status === "open" ? undefined : status} />
      </Tabs>
    </ConsolePageShell>
  );
}
