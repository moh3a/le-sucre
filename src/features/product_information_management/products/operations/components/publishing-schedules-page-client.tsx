"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertTriangle, Ban, Calendar, CheckCircle2 } from "lucide-react";
import { PublishingSchedulesTable } from "./publishing-schedules-table";
import { SchedulePublishingDialog } from "./schedule-publishing-dialog";

export function PublishingSchedulesPageClient() {
  const query = trpc.operations.productGetScheduleStats.useQuery();
  const { data: stats, isLoading } = query;

  return (
    <QueryGuard query={query}>
    <ConsolePageShell
      title="Planifications de publication"
      subtitle="Gérer les publications et dépublications programmées de produits"
      actions={<SchedulePublishingDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "Planifiées", value: stats?.pending ?? 0, icon: Calendar, color: "info" },
            { label: "Exécutées", value: stats?.executed ?? 0, icon: CheckCircle2, color: "success" },
            { label: "Échouées", value: stats?.failed ?? 0, icon: AlertTriangle, color: "error" },
            { label: "Annulées", value: stats?.cancelled ?? 0, icon: Ban, color: "default" },
          ]}
        />
      }
    >
      <PublishingSchedulesTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
