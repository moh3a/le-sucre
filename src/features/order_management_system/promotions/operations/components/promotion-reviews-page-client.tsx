"use client";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { PromotionReviewsTable } from "./promotion-reviews-table";

export function PromotionReviewsPageClient() {
  const { data: stats, isLoading } = trpc.operations.promotionGetReviewStats.useQuery();

  return (
    <QueryGuard query={{ isLoading }}>
    <ConsolePageShell
      title="Validations de promotions"
      subtitle="Examiner et approuver ou rejeter les demandes de promotion"
      stats={
        <StatsGrid
          loading={isLoading}
          items={[
            { label: "En attente", value: stats?.pending ?? 0, icon: Clock, color: "warning" },
            { label: "Approuvées", value: stats?.approved ?? 0, icon: CheckCircle2, color: "success" },
            { label: "Rejetées", value: stats?.rejected ?? 0, icon: XCircle, color: "error" },
            { label: "Total", value: (stats?.pending ?? 0) + (stats?.approved ?? 0) + (stats?.rejected ?? 0), icon: Eye, color: "default" },
          ]}
        />
      }
    >
      <PromotionReviewsTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
