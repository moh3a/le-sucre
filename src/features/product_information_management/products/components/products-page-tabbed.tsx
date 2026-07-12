"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Package, Calendar, Plus } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductsContent } from "./products-page-client";
import { PublishingSchedulesContent } from "@/features/product_information_management/products/operations/components/publishing-schedules-page-client";

const TABS = [
  { value: "products", icon: Package },
  { value: "publishing", icon: Calendar },
] as const;

export function ProductsPageClientTabbed() {
  const t = useTranslations("products");
  const [tab, setTab] = useState("products");

  const actions: Record<string, React.ReactNode> = {
    products: (
      <Button asChild>
        <Link href="/console/products/new">
          <Plus />
          {t("new")}
        </Link>
      </Button>
    ),
    publishing: null,
  };

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={actions[tab]}
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
          <TabsContent value="products" className="mt-0 space-y-4">
            <ProductsContent />
          </TabsContent>

          <TabsContent value="publishing" className="mt-0 space-y-4">
            <PublishingSchedulesContent />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
