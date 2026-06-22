"use client";

import { CheckCircle2, Clock, Package, ReceiptCent, X } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

export function OrderStats() {
  const { data, isFetching, isLoading } = trpc.orders.adminStats.useQuery();

  return (
    <QueryGuard query={{ isLoading, isFetching }}>
    <StatsGrid
      loading={isFetching || isLoading}
      items={[
        {
          label: "Monthly revenue",
          value: data?.monthly_revenue ?? 0,
          icon: ReceiptCent,
          color: "info",
        },
        {
          label: "Monthly orders",
          value: data?.monthly_orders ?? 0,
          icon: ReceiptCent,
          color: "info",
        },
        {
          label: "Average order value",
          value: data?.average_order_value ?? 0,
          icon: CheckCircle2,
          color: "info",
        },
        {
          label: "Active orders",
          value: data?.active_orders ?? 0,
          icon: Package,
          color: "default",
        },
        {
          label: "Pending orders",
          value: data?.pending_orders ?? 0,
          icon: Clock,
          color: "warning",
        },
        {
          label: "Completed orders",
          value: data?.completed_orders ?? 0,
          icon: CheckCircle2,
          color: "success",
        },
        {
          label: "Cancelled orders",
          value: data?.cancelled_orders ?? 0,
          icon: X,
          color: "error",
        },
      ]}
    />
    </QueryGuard>
  );
}
