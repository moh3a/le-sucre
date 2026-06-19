"use client";

import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { PaymentVerificationsTable } from "./payment-verifications-table";

export function PaymentVerificationsPageClient() {
  const { data, isLoading } = trpc.operations.paymentListVerifications.useQuery({
    page: 1,
    limit: 100,
  });
  const pendingCount = trpc.operations.paymentCountPendingVerifications.useQuery();

  const items = data?.items ?? [];
  const verified = items.filter((v) => v.status === "verified").length;
  const rejected = items.filter((v) => v.status === "rejected").length;

  return (
    <ConsolePageShell
      title="Vérifications de paiement"
      subtitle="Vérification manuelle des paiements"
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            {
              label: "En attente",
              value: pendingCount.data ?? 0,
              icon: Clock,
              color: "warning",
            },
            { label: "Vérifiées", value: verified, icon: CheckCircle2, color: "success" },
            { label: "Rejetées", value: rejected, icon: XCircle, color: "error" },
          ]}
        />
      }
    >
      <PaymentVerificationsTable />
    </ConsolePageShell>
  );
}
