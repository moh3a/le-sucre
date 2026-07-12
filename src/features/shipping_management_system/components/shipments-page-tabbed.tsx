"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Package, RotateCcw } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShippingContent } from "./shipping-page-client";
import { DeliveryAttemptsContent } from "@/features/shipping_management_system/operations/components/delivery-page-client";
import { CreateShipmentDialog } from "./create-shipment-dialog";
import { LogAttemptDialog } from "@/features/shipping_management_system/operations/components/log-attempt-dialog";

const TABS = [
  { value: "shipments", icon: Package },
  { value: "delivery_attempts", icon: RotateCcw },
] as const;

export function ShipmentsPageClient() {
  const t = useTranslations("shipping");
  const [tab, setTab] = useState("shipments");

  const actions: Record<string, React.ReactNode> = {
    shipments: <CreateShipmentDialog />,
    delivery_attempts: <LogAttemptDialog />,
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
          <TabsContent value="shipments" className="mt-0 space-y-4">
            <ShippingContent />
          </TabsContent>

          <TabsContent value="delivery_attempts" className="mt-0 space-y-4">
            <DeliveryAttemptsContent />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
