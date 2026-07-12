"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown, BadgeDollarSign, Banknote, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { PaymentsTable } from "./payments-table";
import { RecordPaymentDialog } from "./record-payment-dialog";

export function PaymentsContent() {
  const t = useTranslations("payments");
  const { data: stats, isLoading: statsLoading } = trpc.payments.adminStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading }}>
      <StatsGrid
        loading={statsLoading}
        items={[
          {
            label: t("stats_total_revenue"),
            value: new Intl.NumberFormat("fr-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(stats?.total_revenue ?? 0),
            icon: Banknote,
            color: "success",
          },
          {
            label: t("stats_transactions"),
            value: stats?.total_transactions ?? 0,
            icon: CreditCard,
            color: "info",
          },
          {
            label: t("stats_successful"),
            value: stats?.successful_transactions ?? 0,
            icon: BadgeDollarSign,
            color: "success",
          },
          {
            label: t("stats_failed"),
            value: stats?.failed_transactions ?? 0,
            icon: Wallet,
            color: "error",
          },
          {
            label: t("stats_net_revenue"),
            value: new Intl.NumberFormat("fr-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(stats?.net_revenue ?? 0),
            icon: TrendingUp,
            color: "info",
          },
          {
            label: t("stats_total_fees"),
            value: new Intl.NumberFormat("fr-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(stats?.total_fees ?? 0),
            icon: ArrowUpDown,
            color: "warning",
          },
          {
            label: t("stats_pending"),
            value: stats?.pending_transactions ?? 0,
            icon: CreditCard,
            color: "warning",
          },
          {
            label: t("stats_refunded"),
            value: new Intl.NumberFormat("fr-DZ", {
              style: "currency",
              currency: "DZD",
            }).format(stats?.refund_amount ?? 0),
            icon: Wallet,
            color: "error",
          },
        ]}
      />
      <PaymentsTable />
    </QueryGuard>
  );
}

export function PaymentsPageClient() {
  const t = useTranslations("payments");
  return (
    <ConsolePageShell
      title={t("payments_title")}
      subtitle={t("payments_subtitle")}
      actions={<RecordPaymentDialog />}
    >
      <PaymentsContent />
    </ConsolePageShell>
  );
}
