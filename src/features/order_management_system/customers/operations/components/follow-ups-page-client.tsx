"use client";

import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertTriangle, Phone } from "lucide-react";
import { FollowUpsTable } from "./follow-ups-table";

export function FollowUpsPageClient() {
  const { data, isLoading } = trpc.operations.customerListMyFollowUps.useQuery({ page: 1, limit: 100 });
  const { data: overdue, isLoading: overdueLoading } = trpc.operations.customerGetOverdueFollowUps.useQuery();

  const total = data?.meta?.total_records ?? 0;

  return (
    <ConsolePageShell
      title="Relances et suivis"
      subtitle="Gestion des rappels et suivis clients"
      stats={
        <StatsGrid
          loading={isLoading || overdueLoading}
          items={[
            { label: "En retard", value: overdue?.length ?? 0, icon: AlertTriangle, color: "error" },
            { label: "Suivis actifs", value: total, icon: Phone, color: "info" },
          ]}
        />
      }
    >
      <FollowUpsTable />
    </ConsolePageShell>
  );
}
