"use client";

import { User, ShoppingCart, TrendingUp } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { CustomersTable } from "./customers-table";
import { CreateCustomerDialog } from "./create-customer-dialog";

export function CustomersContent() {
  const { data: stats, isLoading } = trpc.customers.adminStats.useQuery();

  return (
    <QueryGuard query={{ isLoading }}>
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
      <CustomersTable />
    </QueryGuard>
  );
}

export function CustomersPageClient() {
  const { data: stats, isLoading } = trpc.customers.adminStats.useQuery();

  return (
    <QueryGuard query={{ isLoading }}>
    <ConsolePageShell
      title="Clients"
      subtitle="Gestion des clients et analyses"
      actions={<CreateCustomerDialog />}
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
    </QueryGuard>
  );
}
