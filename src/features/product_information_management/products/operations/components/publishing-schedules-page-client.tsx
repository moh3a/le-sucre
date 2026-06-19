"use client";

import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertTriangle, Ban, Calendar, CheckCircle2 } from "lucide-react";
import { PublishingSchedulesTable } from "./publishing-schedules-table";

export function PublishingSchedulesPageClient() {
  const { data: stats, isLoading } = trpc.operations.productGetScheduleStats.useQuery();

  return (
    <ConsolePageShell
      title="Planifications de publication"
      subtitle="Gérer les publications et dépublications programmées de produits"
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
  );
}
