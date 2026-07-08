"use client";

import { useTranslations } from "next-intl";
import { Banknote, CheckCircle2, Clock, RefreshCcw, Wallet, XCircle } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { PayoutsTable } from "./payouts-table";
import { CreatePayoutDialog } from "./create-payout-dialog";

export function PayoutsPageClient() {
  const t = useTranslations("payouts");
  const { data: stats, isFetching: statsLoading } = trpc.payments.adminPayoutStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading }}>
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreatePayoutDialog />}
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            {
              label: t("stats_total"),
              value: stats?.total_payouts ?? 0,
              icon: Banknote,
              color: "info",
            },
            {
              label: t("stats_pending"),
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.pending_net ?? 0),
              icon: Clock,
              color: "warning",
            },
            {
              label: t("stats_completed"),
              value: stats?.completed_payouts ?? 0,
              icon: CheckCircle2,
              color: "success",
            },
            {
              label: t("stats_failed"),
              value: stats?.failed_payouts ?? 0,
              icon: XCircle,
              color: "error",
            },
            {
              label: t("stats_gross"),
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_gross ?? 0),
              icon: Wallet,
              color: "info",
            },
            {
              label: t("stats_commission"),
              value: new Intl.NumberFormat("fr-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(stats?.total_commission ?? 0),
              icon: RefreshCcw,
              color: "info",
            },
          ]}
        />
      }
    >
      <PayoutsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
