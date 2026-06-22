"use client";

import * as React from "react";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { ShoppingCart, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CartsTable } from "./carts-table";
import { CreateCartDialog } from "./create-cart-dialog";

export function CartsPageClient() {
  const { data: stats, isLoading: isStatsLoading } = trpc.cart.adminStats.useQuery();

  const statsItems = React.useMemo(() => {
    return [
      {
        label: "Total Paniers",
        value: stats?.total ?? 0,
        icon: ShoppingCart,
        color: "info" as const,
      },
      {
        label: "Paniers Actifs",
        value: stats?.active ?? 0,
        icon: Activity,
        color: "success" as const,
      },
      {
        label: "Paniers Abandonnés",
        value: stats?.abandoned ?? 0,
        icon: AlertTriangle,
        color: "error" as const,
      },
      {
        label: "Paniers Convertis",
        value: stats?.converted ?? 0,
        icon: CheckCircle2,
        color: "default" as const,
      },
    ];
  }, [stats]);

  return (
    <QueryGuard query={{ isLoading: isStatsLoading }}>
    <ConsolePageShell
      title="Paniers"
      subtitle="Suivi des paniers abandonnés et en cours"
      actions={<CreateCartDialog />}
      stats={<StatsGrid items={statsItems} loading={isStatsLoading} />}
    >
      <CartsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
