"use client";

import { DollarSign, Hash, Percent, Play, Tag, TicketCheck } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { PromotionsTable } from "./promotions-table";
import { CreatePromotionDialog } from "./create-promotion-dialog";

export function PromotionsPageClient() {
  const { data: stats, isLoading: statsLoading } = trpc.promotions.promotionStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: statsLoading }}>
    <ConsolePageShell
      title="Promotions"
      subtitle="Gestion des codes promo, ventes flash et offres groupées"
      actions={<CreatePromotionDialog />}
      stats={
        <StatsGrid
          loading={statsLoading}
          items={[
            { label: "Total", value: stats?.total ?? 0, icon: Tag, color: "default" },
            { label: "Actives", value: stats?.active ?? 0, icon: Play, color: "success" },
            { label: "Brouillons", value: stats?.draft ?? 0, icon: Hash, color: "default" },
            { label: "Planifiées", value: stats?.scheduled ?? 0, icon: Percent, color: "info" },
            { label: "En Pause", value: stats?.paused ?? 0, icon: TicketCheck, color: "warning" },
            {
              label: "Remise Totale",
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
