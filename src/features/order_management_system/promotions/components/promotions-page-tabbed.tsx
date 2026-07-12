"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Tag, Eye } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PromotionsContent } from "./promotions-page-client";
import { PromotionReviewsContent } from "@/features/order_management_system/promotions/operations/components/promotion-reviews-page-client";
import { CreatePromotionDialog } from "./create-promotion-dialog";

const TABS = [
  { value: "promotions", icon: Tag },
  { value: "reviews", icon: Eye },
] as const;

export function PromotionsPageClientTabbed() {
  const t = useTranslations("promotions");
  const [tab, setTab] = useState("promotions");

  const actions: Record<string, React.ReactNode> = {
    promotions: <CreatePromotionDialog />,
    reviews: null,
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
          <TabsContent value="promotions" className="mt-0 space-y-4">
            <PromotionsContent />
          </TabsContent>

          <TabsContent value="reviews" className="mt-0 space-y-4">
            <PromotionReviewsContent />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
