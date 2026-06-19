"use client";

import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { CheckCircle2, Clock, Warehouse } from "lucide-react";
import { InventoryAdjustmentsTable } from "./inventory-adjustments-table";

export function InventoryAdjustmentsPageClient() {
  const { data: stats, isLoading } = trpc.operations.inventoryAdjustmentStats.useQuery();

  return (
    <ConsolePageShell
      title="Ajustements de stock"
      subtitle="Demandes d'ajustement d'inventaire"
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "En attente", value: stats?.pending ?? 0, icon: Clock, color: "warning" },
            { label: "Approuvés", value: stats?.approved ?? 0, icon: CheckCircle2, color: "success" },
          ]}
        />
      }
    >
      <InventoryAdjustmentsTable />
    </ConsolePageShell>
  );
}
