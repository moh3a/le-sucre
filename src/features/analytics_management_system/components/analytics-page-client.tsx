"use client";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboardClient } from "./analytics-dashboard-client";
import { AnalyticsProductsTable } from "./analytics-products-table";

export function AnalyticsPageClient() {
  return (
    <ConsolePageShell title="Analytique" subtitle="Performance boutique et produits">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <AnalyticsDashboardClient />
        </TabsContent>
        <TabsContent value="products" className="mt-4">
          <AnalyticsProductsTable />
        </TabsContent>
      </Tabs>
    </ConsolePageShell>
  );
}
