"use client";

import { Banknote, CheckCircle2, Clock, RefreshCcw, Wallet, XCircle } from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { PayoutsTable } from "./payouts-table";

export function PayoutsPageClient() {
  const { data: stats, isFetching: statsLoading } = trpc.payments.adminPayoutStats.useQuery();

  return (
    <ConsolePageShell
      title="Paiements fournisseurs"
      subtitle="Gestion des paiements aux vendeurs et fournisseurs"
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: "Total paiements",
              value: stats?.total_payouts ?? 0,
              icon: Banknote,
              color: "info",
            },
            {
              label: "En attente",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.pending_net ?? 0),
              icon: Clock,
              color: "warning",
            },
            {
              label: "Complétés",
              value: stats?.completed_payouts ?? 0,
              icon: CheckCircle2,
              color: "success",
            },
            {
              label: "Échoués",
              value: stats?.failed_payouts ?? 0,
              icon: XCircle,
              color: "error",
            },
            {
              label: "Montant brut",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_gross ?? 0),
              icon: Wallet,
              color: "info",
            },
            {
              label: "Commission totale",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_commission ?? 0),
              icon: RefreshCcw,
              color: "info",
            },
          ]}
        />
      }
    >
      <PayoutsTable />
    </ConsolePageShell>
  );
}
