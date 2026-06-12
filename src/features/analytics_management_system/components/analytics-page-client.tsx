"use client";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { default_range } from "../helpers/default-range";
import { AnalyticsDashboardClient } from "./analytics-dashboard-client";
import { AnalyticsProductsTable } from "./analytics-products-table";
import { AnalyticsFunnel } from "./analytics-funnel";
import { AnalyticsCategoriesBrands } from "./analytics-categories-and-brands";
import { AnalyticsSearches } from "./analytics-searches";

export function AnalyticsPageClient() {
  const { from, to } = default_range();

  return (
    <ConsolePageShell title="Analytique" subtitle="Performance boutique et produits">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="categories_brands">Catégories & Marques</TabsTrigger>
          <TabsTrigger value="funnel">Entonnoir</TabsTrigger>
          <TabsTrigger value="searches">Recherches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnalyticsDashboardClient />
        </TabsContent>

        <TabsContent value="products">
          <AnalyticsProductsTable />
        </TabsContent>

        <TabsContent value="categories_brands">
          <AnalyticsCategoriesBrands from={from} to={to} />
        </TabsContent>

        <TabsContent value="funnel">
          <AnalyticsFunnel from={from} to={to} />
        </TabsContent>

        <TabsContent value="searches">
          <AnalyticsSearches from={from} to={to} />
        </TabsContent>
      </Tabs>
    </ConsolePageShell>
  );
}
