"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart3,
  Download,
  LayoutDashboard,
  Search,
  ShoppingBag,
  Tag,
} from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnalyticsDateRangePicker } from "./analytics-date-range-picker";
import { useAnalyticsDateRange } from "../hooks/use-analytics-date-range";
import { AnalyticsOverviewTab } from "./analytics-overview-tab";
import { AnalyticsProductsTab } from "./analytics-products-tab";
import { AnalyticsCategoriesBrands } from "./analytics-categories-and-brands";
import { AnalyticsFunnel } from "./analytics-funnel";
import { AnalyticsSearches } from "./analytics-searches";

const TABS = [
  { value: "overview", icon: LayoutDashboard },
  { value: "products", icon: ShoppingBag },
  { value: "categories_brands", icon: Tag },
  { value: "funnel", icon: BarChart3 },
  { value: "searches", icon: Search },
] as const;

export function AnalyticsPageClient() {
  const t = useTranslations("analytics");
  const [tab, setTab] = useState("overview");
  const { from, to, setFrom, setTo } = useAnalyticsDateRange();

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <div className="flex items-center gap-2">
          <AnalyticsDateRangePicker
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
          <Button variant="outline" size="sm">
            <Download className="mr-1 size-4" />
            {t("export")}
          </Button>
        </div>
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map(({ value, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="size-4" />
              {t(`tab_${value}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <Separator className="my-4" />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t(`tab_${tab}`)}</CardTitle>
            <CardDescription>{t(`tab_description_${tab}`)}</CardDescription>
          </CardHeader>
        </Card>

        <div className="mt-4">
          <TabsContent value="overview" className="mt-0 space-y-4">
            <AnalyticsOverviewTab from={from} to={to} />
          </TabsContent>

          <TabsContent value="products" className="mt-0 space-y-4">
            <AnalyticsProductsTab from={from} to={to} />
          </TabsContent>

          <TabsContent value="categories_brands" className="mt-0 space-y-4">
            <AnalyticsCategoriesBrands from={from} to={to} />
          </TabsContent>

          <TabsContent value="funnel" className="mt-0 space-y-4">
            <AnalyticsFunnel from={from} to={to} />
          </TabsContent>

          <TabsContent value="searches" className="mt-0 space-y-4">
            <AnalyticsSearches from={from} to={to} />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
