"use client";

import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Clock, Wrench } from "lucide-react";
import { WarrantyTable } from "./warranty-table";

export function WarrantyPageClient() {
  const stats = trpc.operations.warrantyStats.useQuery();

  return (
    <ConsolePageShell
      title="Garanties"
      subtitle="Gestion des demandes de garantie"
      stats={
        <StatsGrid
          loading={stats.isLoading}
          items={[
            { label: "En attente", value: stats.data?.pending ?? 0, icon: Clock, color: "warning" },
            { label: "En révision", value: stats.data?.under_review ?? 0, icon: Wrench, color: "info" },
          ]}
        />
      }
    >
      <WarrantyTable />
    </ConsolePageShell>
  );
}
