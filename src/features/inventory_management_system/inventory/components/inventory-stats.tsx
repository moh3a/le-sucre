"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Box, Package, PackageOpen, TrendingUpDown, Warehouse } from "lucide-react";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

export function InventoryStats() {
  const t = useTranslations("inventory");
  const { data, isLoading } = trpc.inventory.adminStats.useQuery();

  return (
    <StatsGrid
      loading={isLoading}
      items={[
        {
          label: t("stock_value"),
          value: data?.total_products ?? 0,
          icon: Box,
          color: "info",
        },
        {
          label: t("sku_count"),
          value: data?.total_skus ?? 0,
          icon: Package,
          color: "info",
        },
        {
          label: t("warehouse_column"),
          value: data?.total_warehouses ?? 0,
          icon: Warehouse,
          color: "default",
        },
        {
          label: t("total_on_hand"),
          value: data?.total_quantity_on_hand ?? 0,
          icon: PackageOpen,
          color: "success",
        },
        {
          label: t("out_of_stock"),
          value: data?.out_of_stock_count ?? 0,
          icon: AlertTriangle,
          color: "error",
        },
        {
          label: t("low_stock"),
          value: data?.low_stock_count ?? 0,
          icon: TrendingUpDown,
          color: "warning",
        },
      ]}
      />
  );
}
