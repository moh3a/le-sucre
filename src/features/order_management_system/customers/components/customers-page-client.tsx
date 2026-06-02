"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { User, ShoppingCart, TrendingUp } from "lucide-react";
import { trpc } from "@/components/providers/app-providers";
import { CustomersTable } from "./customers-table";

export function CustomersPageClient() {
  const { data: stats, isLoading } = trpc.customers.adminStats.useQuery();

  return (
    <ConsolePageShell
      title="Clients"
      subtitle="Gestion des clients et analyses"
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            {
              label: "Total clients",
              value: stats?.total_customers ?? 0,
              icon: User,
              color: "info",
            },
            {
              label: "Total revenus",
              value: `${Number(stats?.total_revenue ?? 0).toLocaleString("fr-FR")} DZD`,
              icon: TrendingUp,
              color: "success",
            },
            {
              label: "Panier moyen",
              value: `${Number(stats?.avg_order_value ?? 0).toLocaleString("fr-FR")} DZD`,
              icon: ShoppingCart,
              color: "warning",
            },
          ]}
        />
      }
    >
      <CustomersTable />
    </ConsolePageShell>
  );
}
