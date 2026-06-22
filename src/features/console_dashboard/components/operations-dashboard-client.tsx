"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import {
  AlertCircle,
  Ban,
  Banknote,
  HeadphonesIcon,
  ListTodo,
  Phone,
  RefreshCw,
  Warehouse,
  Wrench,
} from "lucide-react";

export function OperationsDashboardClient() {
  const escalations = trpc.operations.orderListEscalations.useQuery({
    page: 1,
    limit: 1,
    status: "open",
  });
  const cancellations = trpc.operations.orderListCancellationRequests.useQuery({
    page: 1,
    limit: 1,
    status: "pending",
  });
  const tasks = trpc.operations.adminTaskDashboard.useQuery();
  const pendingPayments = trpc.operations.paymentCountPendingVerifications.useQuery();
  const overdueFollowups = trpc.operations.customerGetOverdueFollowUps.useQuery();

  const loading =
    escalations.isLoading && cancellations.isLoading && tasks.isLoading;

  return (
    <QueryGuard
      isLoading={loading}
      loadingFallback={
        <ConsolePageShell title="Opérations" subtitle="Tableau de bord des opérations quotidiennes">
          <Skeleton className="h-96 w-full" />
        </ConsolePageShell>
      }
      query={{
        error: escalations.error ?? cancellations.error ?? tasks.error ?? pendingPayments.error ?? overdueFollowups.error,
      }}
    >
      <ConsolePageShell
      title="Opérations"
      subtitle="Tableau de bord des opérations quotidiennes"
    >
      <StatsGrid
        loading={false}
        items={[
          {
            label: "Escalades ouvertes",
            value: escalations.data?.meta?.total_records ?? 0,
            icon: AlertCircle,
            color: "error",
            link: "/console/operations/escalations",
          },
          {
            label: "Annulations en attente",
            value: cancellations.data?.meta?.total_records ?? 0,
            icon: Ban,
            color: "error",
            link: "/console/operations/cancellations",
          },
          {
            label: "Tâches en attente",
            value: tasks.data?.pending ?? 0,
            icon: ListTodo,
            color: "info",
            link: "/console/operations/tasks",
          },
          {
            label: "Tâches en retard",
            value: tasks.data?.overdue ?? 0,
            icon: AlertCircle,
            color: "error",
            link: "/console/operations/tasks",
          },
          {
            label: "Paiements en attente",
            value: pendingPayments.data ?? 0,
            icon: Banknote,
            color: "warning",
            link: "/console/operations/payment-verifications",
          },
          {
            label: "Relances en retard",
            value: overdueFollowups.data?.length ?? 0,
            icon: Phone,
            color: "error",
            link: "/console/operations/follow-ups",
          },
          {
            label: "Garanties",
            value: "—",
            icon: Wrench,
            color: "default",
            link: "/console/operations/warranty",
          },
          {
            label: "Remboursements",
            value: "—",
            icon: RefreshCw,
            color: "default",
            link: "/console/operations/refunds",
          },
          {
            label: "Cas de support",
            value: "—",
            icon: HeadphonesIcon,
            color: "default",
            link: "/console/operations/support-cases",
          },
          {
            label: "Ajustements stock",
            value: "—",
            icon: Warehouse,
            color: "default",
            link: "/console/operations/inventory-adjustments",
          },
        ]}
      />
      </ConsolePageShell>
    </QueryGuard>
  );
}
