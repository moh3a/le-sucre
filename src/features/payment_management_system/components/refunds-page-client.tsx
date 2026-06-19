"use client";

import { Banknote, CheckCircle2, Clock, Wallet, XCircle } from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { RefundsTable } from "./refunds-table";
import { CreateRefundDialog } from "./create-refund-dialog";

export function RefundsPageClient() {
  const { data: stats, isFetching: statsLoading } = trpc.payments.adminRefundStats.useQuery();

  return (
    <ConsolePageShell
      title="Remboursements"
      subtitle="Gestion des remboursements"
      actions={<CreateRefundDialog />}
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: "Total remboursements",
              value: stats?.total_refunds ?? 0,
              icon: Banknote,
              color: "info",
            },
            {
              label: "Complétés",
              value: stats?.completed_refunds ?? 0,
              icon: CheckCircle2,
              color: "success",
            },
            {
              label: "En attente",
              value: stats?.pending_refunds ?? 0,
              icon: Clock,
              color: "warning",
            },
            {
              label: "Échoués",
              value: stats?.failed_refunds ?? 0,
              icon: XCircle,
              color: "error",
            },
            {
              label: "Montant total remboursé",
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_refunded_amount ?? 0),
              icon: Wallet,
              color: "info",
            },
            {
              label: "En attente d&apos;approbation",
              value: stats?.pending_approval_count ?? 0,
              icon: Clock,
              color: "warning",
            },
          ]}
        />
      }
    >
      <RefundsTable />
    </ConsolePageShell>
  );
}
