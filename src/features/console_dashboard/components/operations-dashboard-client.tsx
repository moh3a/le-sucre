"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("operations");
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
        <ConsolePageShell title={t("title")} subtitle={t("subtitle")}>
          <Skeleton className="h-96 w-full" />
        </ConsolePageShell>
      }
      query={{
        error: escalations.error ?? cancellations.error ?? tasks.error ?? pendingPayments.error ?? overdueFollowups.error,
      }}
    >
      <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <StatsGrid
        loading={false}
        items={[
          {
            label: t("open_escalations"),
            value: escalations.data?.meta?.total_records ?? 0,
            icon: AlertCircle,
            color: "error",
            link: "/console/operations/escalations",
          },
          {
            label: t("pending_cancellations"),
            value: cancellations.data?.meta?.total_records ?? 0,
            icon: Ban,
            color: "error",
            link: "/console/operations/cancellations",
          },
          {
            label: t("pending_tasks"),
            value: tasks.data?.pending ?? 0,
            icon: ListTodo,
            color: "info",
            link: "/console/operations/tasks",
          },
          {
            label: t("overdue_tasks"),
            value: tasks.data?.overdue ?? 0,
            icon: AlertCircle,
            color: "error",
            link: "/console/operations/tasks",
          },
          {
            label: t("pending_payments"),
            value: pendingPayments.data ?? 0,
            icon: Banknote,
            color: "warning",
            link: "/console/operations/payment-verifications",
          },
          {
            label: t("overdue_followups"),
            value: overdueFollowups.data?.length ?? 0,
            icon: Phone,
            color: "error",
            link: "/console/operations/follow-ups",
          },
          {
            label: t("warranty_title"),
            value: "—",
            icon: Wrench,
            color: "default",
            link: "/console/operations/warranty",
          },
          {
            label: t("refunds_title"),
            value: "—",
            icon: RefreshCw,
            color: "default",
            link: "/console/operations/refunds",
          },
          {
            label: t("support_cases"),
            value: "—",
            icon: HeadphonesIcon,
            color: "default",
            link: "/console/operations/support-cases",
          },
          {
            label: t("stock_adjustments"),
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
