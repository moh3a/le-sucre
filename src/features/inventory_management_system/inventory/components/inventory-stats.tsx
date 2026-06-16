"use client";

import { AlertTriangle, Box, Package, PackageOpen, TrendingUpDown, Warehouse } from "lucide-react";

import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";

export function InventoryStats() {
  const { data, isFetching, isLoading } = trpc.inventory.adminStats.useQuery();

  return (
    <StatsGrid
      loading={isFetching || isLoading}
      items={[
        {
          label: "Produits en stock",
          value: data?.total_products ?? 0,
          icon: Box,
          color: "info",
        },
        {
          label: "SKUs actifs",
          value: data?.total_skus ?? 0,
          icon: Package,
          color: "info",
        },
        {
          label: "Entrepôts",
          value: data?.total_warehouses ?? 0,
          icon: Warehouse,
          color: "default",
        },
        {
          label: "Qté en stock",
          value: data?.total_quantity_on_hand ?? 0,
          icon: PackageOpen,
          color: "success",
        },
        {
          label: "Rupture de stock",
          value: data?.out_of_stock_count ?? 0,
          icon: AlertTriangle,
          color: "error",
        },
        {
          label: "Stock faible",
          value: data?.low_stock_count ?? 0,
          icon: TrendingUpDown,
          color: "warning",
        },
      ]}
    />
  );
}
