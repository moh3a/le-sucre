"use client";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Banknote, CheckCircle2, Clock, XCircle } from "lucide-react";
import { RefundsTable } from "./refunds-table";
import { RequestRefundDialog } from "./request-refund-dialog";

export function RefundsPageClient() {
  const { data, isLoading } = trpc.operations.paymentListRefundRequests.useQuery({
    page: 1,
    limit: 100,
  });

  const items = data?.items ?? [];
  const pending = items.filter((r) => r.status === "pending").length;
  const approved = items.filter((r) => r.status === "approved").length;
  const completed = items.filter((r) => r.status === "completed").length;
  const failed = items.filter((r) => r.status === "failed").length;

  return (
    <QueryGuard query={{ isLoading }}>
    <ConsolePageShell
      title="Remboursements"
      subtitle="Gestion des demandes de remboursement"
      actions={<RequestRefundDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "En attente", value: pending, icon: Clock, color: "warning" },
            { label: "Approuvés", value: approved, icon: CheckCircle2, color: "info" },
            { label: "Terminés", value: completed, icon: Banknote, color: "success" },
            { label: "Échoués", value: failed, icon: XCircle, color: "error" },
          ]}
        />
      }
    >
      <RefundsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
