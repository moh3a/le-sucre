"use client";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { CancellationsTable } from "./cancellations-table";
import { RequestCancellationDialog } from "./request-cancellation-dialog";

export function CancellationsContent() {
  const { data, isLoading } = trpc.operations.orderListCancellationRequests.useQuery({
    page: 1,
    limit: 100,
  });

  const items = data?.items ?? [];
  const pending = items.filter((r) => r.status === "pending").length;
  const approved = items.filter((r) => r.status === "approved").length;
  const rejected = items.filter((r) => r.status === "rejected").length;

  return (
    <QueryGuard query={{ isLoading }}>
      <StatsGrid
        loading={isLoading}
        items={[
          { label: "En attente", value: pending, icon: Clock, color: "warning" },
          { label: "Approuvées", value: approved, icon: CheckCircle2, color: "success" },
          { label: "Rejetées", value: rejected, icon: XCircle, color: "error" },
        ]}
      />
      <CancellationsTable />
    </QueryGuard>
  );
}

export function CancellationsPageClient() {
  const { data, isLoading } = trpc.operations.orderListCancellationRequests.useQuery({
    page: 1,
    limit: 100,
  });

  const items = data?.items ?? [];
  const pending = items.filter((r) => r.status === "pending").length;
  const approved = items.filter((r) => r.status === "approved").length;
  const rejected = items.filter((r) => r.status === "rejected").length;

  return (
    <QueryGuard query={{ isLoading }}>
    <ConsolePageShell
      title="Demandes d'annulation"
      subtitle="Gérer les demandes d'annulation de commandes"
      actions={<RequestCancellationDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "En attente", value: pending, icon: Clock, color: "warning" },
            { label: "Approuvées", value: approved, icon: CheckCircle2, color: "success" },
            { label: "Rejetées", value: rejected, icon: XCircle, color: "error" },
          ]}
        />
      }
    >
      <CancellationsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
