"use client";

import { CheckCircle2, Clock, Package, ReceiptCent } from "lucide-react";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

export function OrderStats() {
  const total = trpc.orders.adminList.useQuery({ page: 1, limit: 1 });
  const pending = trpc.orders.adminList.useQuery({ page: 1, limit: 1, status: "pending_payment" });
  const paid = trpc.orders.adminList.useQuery({ page: 1, limit: 1, status: "paid" });
  const fulfilled = trpc.orders.adminList.useQuery({ page: 1, limit: 1, status: "fulfilled" });

  const loading = total.isLoading || pending.isLoading || paid.isLoading || fulfilled.isLoading;

  return (
    <StatsGrid
      loading={loading}
      items={[
        {
          label: "Total",
          value: total.data?.meta.total_records ?? 0,
          icon: ReceiptCent,
          color: "info",
        },
        {
          label: "En attente",
          value: pending.data?.meta.total_records ?? 0,
          icon: Clock,
          color: "warning",
        },
        {
          label: "Payées",
          value: paid.data?.meta.total_records ?? 0,
          icon: CheckCircle2,
          color: "success",
        },
        {
          label: "Expédiées",
          value: fulfilled.data?.meta.total_records ?? 0,
          icon: Package,
          color: "default",
        },
      ]}
    />
  );
}
