"use client";

import { useTranslations } from "next-intl";
import { DollarSign, Hash, Percent, Play, Tag, TicketCheck } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { PromotionsTable } from "./promotions-table";
import { CreatePromotionDialog } from "./create-promotion-dialog";

export function PromotionsPageClient() {
  const t = useTranslations("promotions");
  const { data: stats, isLoading: statsLoading } = trpc.promotions.promotionStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading }}>
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={<CreatePromotionDialog />}
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            { label: t("stats_total"), value: stats?.total ?? 0, icon: Tag, color: "default" },
            { label: t("stats_active"), value: stats?.active ?? 0, icon: Play, color: "success" },
            { label: t("stats_draft"), value: stats?.draft ?? 0, icon: Hash, color: "default" },
            { label: t("stats_scheduled"), value: stats?.scheduled ?? 0, icon: Percent, color: "info" },
            { label: t("stats_paused"), value: stats?.paused ?? 0, icon: TicketCheck, color: "warning" },
            {
              label: t("stats_total_discount"),
              value: `${Number(stats?.total_discount_amount ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} DZD`,
              icon: DollarSign,
              color: "success",
            },
          ]}
        />
      }
    >
      <PromotionsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
