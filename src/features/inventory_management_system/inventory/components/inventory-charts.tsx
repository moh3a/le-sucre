"use client";

import { useTranslations } from "next-intl";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { AnalyticsLineChart } from "@/features/analytics_management_system/components/analytics-line-chart";
import { AnalyticsBarChart } from "@/features/analytics_management_system/components/analytics-bar-chart";
import { getMovementLabels } from "../constants/movement-types";

export function InventoryCharts() {
  const t = useTranslations("inventory");
  const { data, error, isLoading } = trpc.inventory.adminCharts.useQuery();

  return (
    <QueryGuard query={{ isLoading, error }}>
      {!data ? null : (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <AnalyticsLineChart
            title={t("stock_received")}
            data={data.series.map((item) => ({
              date: item.day_key,
              added: item.quantity_added,
              removed: item.quantity_removed,
              net: item.net_change,
            }))}
            x_key="date"
            y_key="added"
          />
          <AnalyticsLineChart
            title={t("stock_adjusted")}
            data={data.series.map((item) => ({
              date: item.day_key,
              added: item.quantity_added,
              removed: item.quantity_removed,
              net: item.net_change,
            }))}
            x_key="date"
            y_key="removed"
          />
          <AnalyticsLineChart
            title={t("stock_value")}
            data={data.series.map((item) => ({
              date: item.day_key,
              added: item.quantity_added,
              removed: item.quantity_removed,
              net: item.net_change,
            }))}
            x_key="date"
            y_key="net"
          />
          <AnalyticsBarChart
            title={t("movements")}
            data={data.movement_distribution.map((item) => ({
              type: getMovementLabels(t)[item.movement_type],
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
