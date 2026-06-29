"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertTriangle, RotateCcw, Truck, XCircle } from "lucide-react";
import { DeliveryAttemptsTable } from "./delivery-attempts-table";
import { LogAttemptDialog } from "./log-attempt-dialog";

export function DeliveryPageClient() {
  const t = useTranslations("delivery_attempts");
  const { data: stats, isLoading, error } = trpc.operations.deliveryGetStats.useQuery();

  return (
    <QueryGuard query={{ isLoading, error }}>
    <ConsolePageShell
      title={t("delivery_title")}
      subtitle={t("delivery_subtitle")}
      actions={<LogAttemptDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: t("stats_successful"), value: stats?.total_successful ?? 0, icon: Truck, color: "success" },
            { label: t("stats_failed"), value: stats?.total_failed ?? 0, icon: XCircle, color: "error" },
            { label: t("stats_today_failed"), value: stats?.today_failed ?? 0, icon: AlertTriangle, color: "error" },
            { label: t("stats_rto"), value: stats?.total_rto ?? 0, icon: RotateCcw, color: "warning" },
          ]}
        />
      }
    >
      <DeliveryAttemptsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
