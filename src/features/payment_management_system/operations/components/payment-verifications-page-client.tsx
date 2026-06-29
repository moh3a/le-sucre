"use client";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { PaymentVerificationsTable } from "./payment-verifications-table";
import { CreateVerificationDialog } from "./create-verification-dialog";
import { RecordPartialPaymentDialog } from "./record-partial-payment-dialog";

export function PaymentVerificationsPageClient() {
  const t = useTranslations("verifications");
  const { data, isLoading } = trpc.operations.paymentListVerifications.useQuery({
    page: 1,
    limit: 100,
  });
  const pendingCount = trpc.operations.paymentCountPendingVerifications.useQuery();

  const items = data?.items ?? [];
  const verified = items.filter((v) => v.status === "verified").length;
  const rejected = items.filter((v) => v.status === "rejected").length;

  return (
    <QueryGuard query={{ isLoading }}>
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <div className="flex gap-2">
          <CreateVerificationDialog />
          <RecordPartialPaymentDialog />
        </div>
      }
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            {
              label: t("stats_pending"),
              value: pendingCount.data ?? 0,
              icon: Clock,
              color: "warning",
            },
            { label: t("stats_verified"), value: verified, icon: CheckCircle2, color: "success" },
            { label: t("stats_rejected"), value: rejected, icon: XCircle, color: "error" },
          ]}
        />
      }
    >
      <PaymentVerificationsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
