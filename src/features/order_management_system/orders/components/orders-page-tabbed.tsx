"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart, XCircle, AlertTriangle, Wrench } from "lucide-react";

import { ConsolePageShell } from "@/components/console/console-page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrdersContent } from "./orders-page-client";
import { CancellationsContent } from "@/features/order_management_system/orders/operations/components/cancellations-page-client";
import { EscalationsContent } from "@/features/order_management_system/orders/operations/components/escalations-page-client";
import { WarrantyContent } from "@/features/order_management_system/warranty/components/warranty-page-client";
import { CreateOrderDialog } from "./create-order";
import { RequestCancellationDialog } from "@/features/order_management_system/orders/operations/components/request-cancellation-dialog";
import { EscalateOrderDialog } from "@/features/order_management_system/orders/operations/components/escalate-order-dialog";
import { CreateWarrantyClaimDialog } from "@/features/order_management_system/warranty/components/create-warranty-claim-dialog";
import { OrderStats } from "./order-stats";

const TABS = [
  { value: "orders", icon: ShoppingCart },
  { value: "cancellations", icon: XCircle },
  { value: "escalations", icon: AlertTriangle },
  { value: "warranty", icon: Wrench },
] as const;

export function OrdersPageClientTabbed() {
  const t = useTranslations("orders");
  const [tab, setTab] = useState("orders");

  const actions: Record<string, React.ReactNode> = {
    orders: <CreateOrderDialog />,
    cancellations: <RequestCancellationDialog />,
    escalations: <EscalateOrderDialog />,
    warranty: <CreateWarrantyClaimDialog />,
  };

  return (
    <ConsolePageShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={actions[tab]}
    >
      {tab === "orders" && <OrderStats />}

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
          <TabsContent value="orders" className="mt-0 space-y-4">
            <OrdersContent />
          </TabsContent>

          <TabsContent value="cancellations" className="mt-0 space-y-4">
            <CancellationsContent />
          </TabsContent>

          <TabsContent value="escalations" className="mt-0 space-y-4">
            <EscalationsContent />
          </TabsContent>

          <TabsContent value="warranty" className="mt-0 space-y-4">
            <WarrantyContent />
          </TabsContent>
        </div>
      </Tabs>
    </ConsolePageShell>
  );
}
