"use client";

import * as React from "react";
import { Layers, Activity, AlertTriangle, ShoppingCart } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { VariantsTable } from "./variants-table";

export function VariantsPageClient() {
  const stats_query = trpc.variants.adminStats.useQuery();
  const { data: stats, isLoading: isStatsLoading } = stats_query;

  const statsItems = React.useMemo(() => {
    return [
      {
        label: "Total Variantes",
        value: stats?.total ?? 0,
        icon: Layers,
        color: "info" as const,
      },
      {
        label: "Variantes Actives",
        value: stats?.active ?? 0,
        icon: Activity,
        color: "success" as const,
      },
      {
        label: "En Rupture",
        value: stats?.out_of_stock ?? 0,
        icon: AlertTriangle,
        color: "error" as const,
      },
      {
        label: "Stock Total",
        value: (stats?.total_stock ?? 0).toLocaleString("fr-FR"),
        icon: ShoppingCart,
        color: "default" as const,
      },
    ];
  }, [stats]);

  return (
    <QueryGuard query={stats_query}>
      <ConsolePageShell
        title="Variantes"
        subtitle="Gestion des variantes et des SKUs"
        stats={<StatsGrid items={statsItems} loading={isStatsLoading} />}
      >
        <VariantsTable />
      </ConsolePageShell>
    </QueryGuard>
  );
}
