"use client";

import { MessageSquare, ShieldAlert, Star, Clock } from "lucide-react";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { AdminReviewModerationTable } from "./admin-review-moderation-table";
import { AnalyticsLineChart } from "@/features/analytics_management_system/components/analytics-line-chart";

export function ReviewsPageClient() {
  const stats = trpc.reviews.adminStats.useQuery();
  const trends = trpc.reviews.ratingTrends.useQuery({ days: 30 });

  return (
    <ConsolePageShell
      title="Avis clients"
      subtitle="Modération et performance"
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
              value: stats.data?.average_rating ?? 0,
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
        <section className="rounded-lg border p-4">
          <h2 className="font-heading mb-4 text-lg">Tendance des notes</h2>
          <AnalyticsLineChart data={trends.data} x_key="day_key" y_key="average_rating" />
        </section>
      ) : null}
      <AdminReviewModerationTable />
    </ConsolePageShell>
  );
}
