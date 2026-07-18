"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Truck, ShoppingCart, CheckCircle } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreateSupplierDialog,
  SuppliersListClient,
  CreatePurchaseOrderDialog,
  PurchaseOrdersListClient,
} from "@/features/operations_workflows/components/procurement-client";
import { ReconciliationClient } from "@/features/operations_workflows/components/reconciliation-client";

const TABS = [
  { value: "suppliers", icon: Truck },
  { value: "purchase_orders", icon: ShoppingCart },
  { value: "reconciliation", icon: CheckCircle },
] as const;

export default function ProcurementPage() {
  const t = useTranslations("procurement");
  const [tab, setTab] = useState("suppliers");

  const actions: Record<string, React.ReactNode> = {
    suppliers: <CreateSupplierDialog />,
    purchase_orders: <CreatePurchaseOrderDialog />,
    reconciliation: null,
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
          <TabsContent value="suppliers" className="mt-0 space-y-4">
            <SuppliersListClient />
          </TabsContent>

          <TabsContent value="purchase_orders" className="mt-0 space-y-4">
            <PurchaseOrdersListClient />
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-0 space-y-4">
            <ReconciliationClient />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
