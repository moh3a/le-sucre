"use client";

import { FolderTree, Package, ReceiptCent } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import { trpc } from "@/components/providers/app-providers";
import { OrderTable } from "@/features/order_management_system/orders/components/order-table";

export function DashboardPageClient() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(new Date() - 7 * 86400000).toISOString().slice(0, 10);

  const analytics = trpc.analytics.overview.useQuery({ from, to });
  const orders = trpc.orders.adminList.useQuery({ page: 1, limit: 1 });
  const products = trpc.products.list.useQuery({ page: 1, limit: 1, status: "published" });
  const categories = trpc.categories.list.useQuery({ page: 1, limit: 1 });

  const loading =
    analytics.isLoading || orders.isLoading || products.isLoading || categories.isLoading;

  return (
    <ConsolePageShell
      title="Tableau de bord"
      subtitle="Vue d'ensemble de la boutique"
      stats={
        <StatsGrid
          loading={loading}
          items={[
            {
              label: "Revenus (7 j)",
              value: analytics.data?.totals?.revenue ?? "—",
              description: "Chiffre d'affaires",
              icon: ReceiptCent,
              color: "success",
            },
            {
              label: "Commandes",
              value: orders.data?.meta.total_records ?? 0,
              description: "Total commandes",
              icon: ReceiptCent,
              color: "info",
            },
            {
              label: "Produits publiés",
              value: products.data?.meta.total_records ?? 0,
              description: "Catalogue actif",
              icon: Package,
              color: "default",
            },
            {
              label: "Catégories",
              value: categories.data?.meta.total_records ?? 0,
              description: "Arborescence catalogue",
              icon: FolderTree,
              color: "warning",
            },
          ]}
        />
      }
    >
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Dernières commandes</h2>
        <OrderTable compact />
      </section>
    </ConsolePageShell>
  );
}
