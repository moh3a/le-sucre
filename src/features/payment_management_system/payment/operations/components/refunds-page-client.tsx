"use client";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Banknote, CheckCircle2, Clock, XCircle } from "lucide-react";
import { RefundsTable } from "./refunds-table";
import { RequestRefundDialog } from "./request-refund-dialog";

export function RefundRequestsContent() {
  const t = useTranslations("refunds");
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
      <StatsGrid
        loading={isLoading}
        items={[
          { label: t("stats_pending"), value: pending, icon: Clock, color: "warning" },
          { label: t("stats_approved"), value: approved, icon: CheckCircle2, color: "info" },
          { label: t("stats_completed"), value: completed, icon: Banknote, color: "success" },
          { label: t("stats_failed"), value: failed, icon: XCircle, color: "error" },
        ]}
      />
      <RefundsTable />
    </QueryGuard>
  );
}

export function RefundsPageClient() {
  const t = useTranslations("refunds");
  return (
    <ConsolePageShell
      title={t("ops_title")}
      subtitle={t("ops_subtitle")}
      actions={<RequestRefundDialog />}
    >
      <RefundRequestsContent />
    </ConsolePageShell>
  );
}
