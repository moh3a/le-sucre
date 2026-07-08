"use client";

import { useTranslations } from "next-intl";
import { ArrowLeftRight, Clock, PackageX, RotateCcw } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { AdminReturnsTable } from "./admin-returns-table";

export function AdminReturnsPageClient() {
  const t = useTranslations("return_requests");
  const { data: stats, isLoading } = trpc.returns.adminList.useQuery({
    page: 1,
    limit: 1,
  });

  const total = stats?.meta.total_records ?? 0;
  const pending = stats?.meta.total_records ?? 0;

  return (
    <QueryGuard query={{ isLoading }}>
      <ConsolePageShell
        title={t("title")}
        subtitle={t("subtitle")}
        stats={
          <StatsGrid
            loading={isLoading}
            items={[
              { label: t("stats_total"), value: total, icon: RotateCcw, color: "default" },
              { label: t("stats_pending"), value: pending, icon: Clock, color: "warning" },
              { label: t("stats_returns"), value: 0, icon: PackageX, color: "info" },
              { label: t("stats_replacements"), value: 0, icon: ArrowLeftRight, color: "success" },
            ]}
          />
        }
      >
        <AdminReturnsTable />
      </ConsolePageShell>
    </QueryGuard>
  );
}
