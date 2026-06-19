"use client";

import { ArrowUpDown, BadgeDollarSign, Banknote, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { PaymentsTable } from "./payments-table";

export function PaymentsPageClient() {
  const { data: stats, isFetching: statsLoading } = trpc.payments.adminStats.useQuery();

  return (
    <ConsolePageShell
      title="Paiements"
      subtitle="Gestion des transactions de paiement"
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: "Revenu total",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_revenue ?? 0),
              icon: Banknote,
              color: "success",
            },
            {
              label: "Transactions",
              value: stats?.total_transactions ?? 0,
              icon: CreditCard,
              color: "info",
            },
            {
              label: "Réussi",
              value: stats?.successful_transactions ?? 0,
              icon: BadgeDollarSign,
              color: "success",
            },
            {
              label: "Échoué",
              value: stats?.failed_transactions ?? 0,
              icon: Wallet,
              color: "error",
            },
            {
              label: "Revenu net",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.net_revenue ?? 0),
              icon: TrendingUp,
              color: "info",
            },
            {
              label: "Frais totaux",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_fees ?? 0),
              icon: ArrowUpDown,
              color: "warning",
            },
            {
              label: "En attente",
              value: stats?.pending_transactions ?? 0,
              icon: CreditCard,
              color: "warning",
            },
            {
              label: "Remboursé",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.refund_amount ?? 0),
              icon: Wallet,
              color: "error",
            },
          ]}
        />
      }
    >
      <PaymentsTable />
    </ConsolePageShell>
  );
}
