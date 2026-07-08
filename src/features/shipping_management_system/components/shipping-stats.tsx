"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, Package, RefreshCcw, Truck, XCircle } from "lucide-react";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";

export function ShippingStats() {
  const t = useTranslations("shipping");
  const { data, isFetching, isLoading, error } = trpc.shipping.adminStats.useQuery();

  return (
    <QueryGuard query={{ isLoading: isFetching || isLoading, error }}>
      <StatsGrid
        loading={isFetching || isLoading}
        items={[
          {
            label: t("stats_total_shipments"),
            value: data?.total ?? 0,
            icon: Truck,
            color: "info",
          },
          {
            label: t("stats_draft"),
            value: data?.draft ?? 0,
            icon: Package,
            color: "default",
          },
          {
            label: t("stats_in_transit"),
            value: data?.in_transit ?? 0,
            icon: RefreshCcw,
            color: "warning",
          },
          {
            label: t("stats_delivered"),
            value: data?.delivered ?? 0,
            icon: CheckCircle2,
            color: "success",
          },
          {
            label: t("stats_failed"),
            value: data?.failed ?? 0,
            icon: XCircle,
            color: "error",
          },
          {
            label: t("stats_pending_sync"),
            value: data?.pending_sync ?? 0,
            icon: Clock,
            color: "warning",
          },
        ]}
      />
    </QueryGuard>
  );
}
