"use client";

import { useTranslations } from "next-intl";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { default_range } from "../helpers/default-range";
import { AnalyticsDashboardClient } from "./analytics-dashboard-client";
import { AnalyticsProductsTable } from "./analytics-products-table";
import { AnalyticsFunnel } from "./analytics-funnel";
import { AnalyticsCategoriesBrands } from "./analytics-categories-and-brands";
import { AnalyticsSearches } from "./analytics-searches";

export function AnalyticsPageClient() {
  const t = useTranslations("analytics");
  const { from, to } = default_range();

  return (
    <ConsolePageShell title={t("title")} subtitle={t("subtitle")}>
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">{t("tab_overview")}</TabsTrigger>
          <TabsTrigger value="products">{t("tab_products")}</TabsTrigger>
          <TabsTrigger value="categories_brands">{t("tab_categories_brands")}</TabsTrigger>
          <TabsTrigger value="funnel">{t("tab_funnel")}</TabsTrigger>
          <TabsTrigger value="searches">{t("tab_searches")}</TabsTrigger>
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
