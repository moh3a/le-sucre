"use client";

import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertCircle, CheckCircle2, Clock, Eye } from "lucide-react";
import { EscalationsTable } from "./escalations-table";
import { EscalateOrderDialog } from "./escalate-order-dialog";

export function EscalationsPageClient() {
  const { data, isLoading } = trpc.operations.orderListEscalations.useQuery({ page: 1, limit: 100 });

  const items = data?.items ?? [];
  const open = items.filter((e) => e.status === "open").length;
  const in_review = items.filter((e) => e.status === "in_review").length;
  const resolved = items.filter((e) => e.status === "resolved").length;

  return (
    <ConsolePageShell
      title="Escalades"
      subtitle="Gestion des escalades de commandes"
      actions={<EscalateOrderDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "Ouvertes", value: open, icon: AlertCircle, color: "error" },
            { label: "En révision", value: in_review, icon: Clock, color: "warning" },
            { label: "Résolues", value: resolved, icon: CheckCircle2, color: "success" },
            { label: "Total", value: data?.meta?.total_records ?? 0, icon: Eye, color: "default" },
          ]}
        />
      }
    >
      <EscalationsTable />
    </ConsolePageShell>
  );
}
