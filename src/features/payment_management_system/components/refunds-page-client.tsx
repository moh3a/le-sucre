"use client";

import { useTranslations } from "next-intl";
import { Banknote, CheckCircle2, Clock, Wallet, XCircle } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { RefundsTable } from "./refunds-table";
import { CreateRefundDialog } from "./create-refund-dialog";

export function RefundsPageClient() {
  const t = useTranslations("refunds");
  const { data: stats, isLoading: statsLoading } = trpc.payments.adminRefundStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading }}>
      <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreateRefundDialog />}
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: t("stats_total"),
              value: stats?.total_refunds ?? 0,
              icon: Banknote,
              color: "info",
            },
            {
              label: t("stats_completed"),
              value: stats?.completed_refunds ?? 0,
              icon: CheckCircle2,
              color: "success",
            },
            {
              label: t("stats_pending"),
              value: stats?.pending_refunds ?? 0,
              icon: Clock,
              color: "warning",
            },
            {
              label: t("stats_failed"),
              value: stats?.failed_refunds ?? 0,
              icon: XCircle,
              color: "error",
            },
            {
              label: t("stats_total_amount"),
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_refunded_amount ?? 0),
              icon: Wallet,
              color: "info",
            },
            {
              label: t("stats_pending_approval"),
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
    </QueryGuard>
  );
}
