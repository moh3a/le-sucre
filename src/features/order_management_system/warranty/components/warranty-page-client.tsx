"use client";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { Clock, Wrench } from "lucide-react";
import { WarrantyTable } from "./warranty-table";
import { CreateWarrantyClaimDialog } from "./create-warranty-claim-dialog";

export function WarrantyContent() {
  const t = useTranslations("warranty");
  const stats = trpc.operations.warrantyStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: stats.isLoading }}>
      <StatsGrid
        loading={stats.isLoading}
        items={[
          { label: t("stats_pending"), value: stats.data?.pending ?? 0, icon: Clock, color: "warning" },
          { label: t("stats_under_review"), value: stats.data?.under_review ?? 0, icon: Wrench, color: "info" },
        ]}
      />
      <WarrantyTable />
    </QueryGuard>
  );
}

export function WarrantyPageClient() {
  const t = useTranslations("warranty");
  const stats = trpc.operations.warrantyStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: stats.isLoading }}>
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreateWarrantyClaimDialog />}
      stats={
        <StatsGrid
          loading={stats.isLoading}
          items={[
            { label: t("stats_pending"), value: stats.data?.pending ?? 0, icon: Clock, color: "warning" },
            { label: t("stats_under_review"), value: stats.data?.under_review ?? 0, icon: Wrench, color: "info" },
          ]}
        />
      }
    >
      <WarrantyTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
