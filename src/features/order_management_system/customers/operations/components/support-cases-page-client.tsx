"use client";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { CheckCircle2, Clock, Headphones, XCircle } from "lucide-react";
import { SupportCasesTable } from "./support-cases-table";
import { CreateSupportCaseDialog } from "./create-support-case-dialog";

export function SupportCasesContent() {
  const { data, isLoading } = trpc.operations.customerListCases.useQuery({
    page: 1,
    limit: 100,
  });

  const items = data?.items ?? [];
  const open = items.filter((c) => c.status === "open" || c.status === "assigned" || c.status === "in_progress").length;
  const resolved = items.filter((c) => c.status === "resolved").length;
  const closed = items.filter((c) => c.status === "closed").length;

  return (
    <QueryGuard query={{ isLoading }}>
      <StatsGrid
        loading={isLoading}
        items={[
          { label: "Actifs", value: open, icon: Clock, color: "warning" },
          { label: "Résolus", value: resolved, icon: CheckCircle2, color: "success" },
          { label: "Fermés", value: closed, icon: XCircle, color: "default" },
          { label: "Total", value: items.length, icon: Headphones, color: "info" },
        ]}
      />
      <SupportCasesTable />
    </QueryGuard>
  );
}

export function SupportCasesPageClient() {
  const { data, isLoading } = trpc.operations.customerListCases.useQuery({
    page: 1,
    limit: 100,
  });

  const items = data?.items ?? [];
  const open = items.filter((c) => c.status === "open" || c.status === "assigned" || c.status === "in_progress").length;
  const resolved = items.filter((c) => c.status === "resolved").length;
  const closed = items.filter((c) => c.status === "closed").length;

  return (
    <QueryGuard query={{ isLoading }}>
    <ConsolePageShell
      title="Cas de support"
      subtitle="Gestion des cas de support client"
      actions={<CreateSupportCaseDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "Actifs", value: open, icon: Clock, color: "warning" },
            { label: "Résolus", value: resolved, icon: CheckCircle2, color: "success" },
            { label: "Fermés", value: closed, icon: XCircle, color: "default" },
            { label: "Total", value: items.length, icon: Headphones, color: "info" },
          ]}
        />
      }
    >
      <SupportCasesTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
