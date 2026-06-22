"use client";

import { CheckCircle2, Clock, Package, RefreshCcw, Truck, XCircle } from "lucide-react";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function ShippingStats() {
  const { data, isFetching, isLoading, error } = trpc.shipping.adminStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: isFetching || isLoading, error }}>
    <StatsGrid
      loading={isFetching || isLoading}
      items={[
        {
          label: "Expéditions totales",
          value: data?.total ?? 0,
          icon: Truck,
          color: "info",
        },
        {
          label: "Brouillons",
          value: data?.draft ?? 0,
          icon: Package,
          color: "default",
        },
        {
          label: "En transit",
          value: data?.in_transit ?? 0,
          icon: RefreshCcw,
          color: "warning",
        },
        {
          label: "Livrées",
          value: data?.delivered ?? 0,
          icon: CheckCircle2,
          color: "success",
        },
        {
          label: "Échecs",
          value: data?.failed ?? 0,
          icon: XCircle,
          color: "error",
        },
        {
          label: "Sync en attente",
          value: data?.pending_sync ?? 0,
          icon: Clock,
          color: "warning",
        },
      ]}
    />
    </QueryGuard>
  );
}
