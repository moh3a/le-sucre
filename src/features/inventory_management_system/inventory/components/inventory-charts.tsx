"use client";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { AnalyticsLineChart } from "@/features/analytics_management_system/components/analytics-line-chart";
import { AnalyticsBarChart } from "@/features/analytics_management_system/components/analytics-bar-chart";
import { MOVEMENT_LABELS } from "../constants/movement-types";

export function InventoryCharts() {
  const { data, error, isLoading } = trpc.inventory.adminCharts.useQuery();

  return (
    <QueryGuard query={{ isLoading, error }}>
      {!data ? null : (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <AnalyticsLineChart
            title="Mouvements de stock (30 jours) - Ajouté"
            data={data.series.map((item) => ({
              date: item.day_key,
              ajouté: item.quantity_added,
              retiré: item.quantity_removed,
              net: item.net_change,
            }))}
            x_key="date"
            y_key="ajouté"
          />
          <AnalyticsLineChart
            title="Mouvements de stock (30 jours) - Retiré"
            data={data.series.map((item) => ({
              date: item.day_key,
              ajouté: item.quantity_added,
              retiré: item.quantity_removed,
              net: item.net_change,
            }))}
            x_key="date"
            y_key="retiré"
          />
          <AnalyticsLineChart
            title="Variation nette"
            data={data.series.map((item) => ({
              date: item.day_key,
              ajouté: item.quantity_added,
              retiré: item.quantity_removed,
              net: item.net_change,
            }))}
            x_key="date"
            y_key="net"
          />
          <AnalyticsBarChart
            title="Répartition des types de mouvement"
            data={data.movement_distribution.map((item) => ({
              type: MOVEMENT_LABELS[item.movement_type],
              count: item.count,
            }))}
            x_key="type"
            y_key="count"
          />
        </div>
      )}
    </QueryGuard>
  );
}
