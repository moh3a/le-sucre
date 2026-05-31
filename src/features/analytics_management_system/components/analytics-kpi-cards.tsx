"use client";

import { DollarSign, ReceiptCent, Repeat, TrendingUp } from "lucide-react";
import { StatsGrid } from "@/components/console/stats-grid";

export function AnalyticsKpiCards({
  totals,
  repeat,
}: {
  totals?: { revenue?: string; orders?: number; avg_conversion?: number; abandoned_carts?: number };
  repeat?: { repeat_rate?: number; repeat_customers?: number };
}) {
  return (
    <StatsGrid
      items={[
        {
          label: "Revenu",
          value: `${Number(totals?.revenue ?? 0).toFixed(0)} DZD`,
          icon: DollarSign,
          color: "success",
        },
        { label: "Commandes", value: totals?.orders ?? 0, icon: ReceiptCent, color: "info" },
        {
          label: "Conversion",
          value: `${((totals?.avg_conversion ?? 0) * 100).toFixed(1)}%`,
          icon: TrendingUp,
          color: "warning",
        },
        {
          label: "Clients récurrents",
          value: repeat?.repeat_customers ?? 0,
          icon: Repeat,
          color: "default",
        },
      ]}
    />
  );
}
