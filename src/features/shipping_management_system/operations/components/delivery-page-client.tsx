"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertTriangle, RotateCcw, Truck, XCircle } from "lucide-react";
import { DeliveryAttemptsTable } from "./delivery-attempts-table";
import { LogAttemptDialog } from "./log-attempt-dialog";

export function DeliveryPageClient() {
  const { data: stats, isLoading, error } = trpc.operations.deliveryGetStats.useQuery();

  return (
    <QueryGuard query={{ isLoading, error }}>
    <ConsolePageShell
      title="Livraisons"
      subtitle="Gestion des tentatives de livraison, des retours et des réexpéditions"
      actions={<LogAttemptDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "Tentatives réussies", value: stats?.total_successful ?? 0, icon: Truck, color: "success" },
            { label: "Tentatives échouées", value: stats?.total_failed ?? 0, icon: XCircle, color: "error" },
            { label: "Échecs aujourd'hui", value: stats?.today_failed ?? 0, icon: AlertTriangle, color: "error" },
            { label: "Retours entrepôt (RTO)", value: stats?.total_rto ?? 0, icon: RotateCcw, color: "warning" },
          ]}
        />
      }
    >
      <DeliveryAttemptsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
