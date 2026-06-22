"use client";

import { MessageSquare, ShieldAlert, Star, Clock } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { LineChart } from "@/components/ui/line-chart";
import { AdminReviewModerationTable } from "./admin-review-moderation-table";
import { CreateReviewDialog } from "./create-review-dialog";

export function ReviewsPageClient() {
  const stats = trpc.reviews.adminStats.useQuery();
  const trends = trpc.reviews.ratingTrends.useQuery({ days: 30 });
  return (
    <QueryGuard query={{ isLoading: stats.isLoading }}>
    <ConsolePageShell
      title="Avis clients"
      subtitle="Modération et performance"
      actions={<CreateReviewDialog />}
      stats={
        <StatsGrid
          loading={stats.isLoading}
          items={[
            {
              label: "Total avis",
              value: stats.data?.total ?? 0,
              icon: MessageSquare,
              color: "info",
            },
            {
              label: "Note moyenne",
              value: stats.data?.average_rating ?? "0.0",
              icon: Star,
              color: "warning",
            },
            { label: "En attente", value: stats.data?.pending ?? 0, icon: Clock, color: "default" },
            {
              label: "Signalés",
              value: stats.data?.reported ?? 0,
              icon: ShieldAlert,
              color: "error",
            },
          ]}
        />
      }
    >
      {trends.data?.length ? (
        <LineChart
          title="Tendance des notes"
          description="Note moyenne des avis sur 30 jours"
          data={trends.data}
          x_key="day_key"
          y_key="average_rating"
        />
      ) : null}
      <AdminReviewModerationTable />
    </ConsolePageShell>
    </QueryGuard>
  );
}
