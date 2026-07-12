"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AlertTriangle, Ban, Calendar, CheckCircle2 } from "lucide-react";
import { PublishingSchedulesTable } from "./publishing-schedules-table";
import { SchedulePublishingDialog } from "./schedule-publishing-dialog";

export function PublishingSchedulesContent() {
  const t = useTranslations("publishing");
  const query = trpc.operations.productGetScheduleStats.useQuery();
  const { data: stats, isLoading } = query;

  return (
    <QueryGuard query={query}>
      <StatsGrid
        loading={isLoading}
        items={[
          { label: t("stats_pending"), value: stats?.pending ?? 0, icon: Calendar, color: "info" },
          { label: t("stats_executed"), value: stats?.executed ?? 0, icon: CheckCircle2, color: "success" },
          { label: t("stats_failed"), value: stats?.failed ?? 0, icon: AlertTriangle, color: "error" },
          { label: t("stats_cancelled"), value: stats?.cancelled ?? 0, icon: Ban, color: "default" },
        ]}
      />
      <PublishingSchedulesTable />
    </QueryGuard>
  );
}

export function PublishingSchedulesPageClient() {
  const t = useTranslations("publishing");
  const query = trpc.operations.productGetScheduleStats.useQuery();
  const { data: stats, isLoading } = query;

  return (
    <QueryGuard query={query}>
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<SchedulePublishingDialog />}
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: t("stats_pending"), value: stats?.pending ?? 0, icon: Calendar, color: "info" },
            { label: t("stats_executed"), value: stats?.executed ?? 0, icon: CheckCircle2, color: "success" },
            { label: t("stats_failed"), value: stats?.failed ?? 0, icon: AlertTriangle, color: "error" },
            { label: t("stats_cancelled"), value: stats?.cancelled ?? 0, icon: Ban, color: "default" },
          ]}
        />
      }
    >
      <PublishingSchedulesTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
