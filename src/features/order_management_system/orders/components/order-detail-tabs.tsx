"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShipmentPanel } from "@/features/fulfillment_management_system/shipping/components/shipment-panel";
import { ReturnPanel } from "@/features/order_management_system/return_replacement/components/return-panel";
import { GeneralTab } from "./general-tab";
import { ItemsTab } from "./items-tab";
import { ShippingTab } from "./shipping-tab";
import { PaymentsTab } from "./payments-tab";
import { InvoicesTab } from "./invoices-tab";
import { OrderOperationsTab } from "./order-operations-tab";
import { OrderCommentsTab } from "./order-comments-tab";
import { TimelineTab } from "./timeline-tab";
import { DeleteOrderDialog } from "./delete-order-dialog";

type OrderDetailTabsProps = { order_id: string };

export function OrderDetailTabs({ order_id }: OrderDetailTabsProps) {
  const t = useTranslations("orders");
  const router = useRouter();
  const { data, isLoading, refetch } = trpc.orders.adminGet.useQuery({ order_id });
  const [delete_open, set_delete_open] = useState(false);

  if (!data && !isLoading) return <p className="text-muted-foreground">{t("order_not_found")}</p>;

  const { order, items, adjustments } = data ?? { order: null, items: [], adjustments: [] };
  const shipping_addr = (order?.shipping_address as Record<string, string>) ?? {};

  return (
    <QueryGuard
      query={{ isLoading }}
      loadingFallback={
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
          ))}
        </div>
      }
    >
      {order && (
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">{t("general_tab")}</TabsTrigger>
            <TabsTrigger value="items">
              {t("items_tab")} ({items.length})
            </TabsTrigger>
            <TabsTrigger value="shipping">{t("shipping_tab")}</TabsTrigger>
            <TabsTrigger value="payments">{t("payments_tab")}</TabsTrigger>
            <TabsTrigger value="invoices">{t("invoices_tab")}</TabsTrigger>
            <TabsTrigger value="returns">{t("returns_tab")}</TabsTrigger>
            <TabsTrigger value="operations">{t("operations_tab")}</TabsTrigger>
            <TabsTrigger value="comments">{t("comments_tab")}</TabsTrigger>
            <TabsTrigger value="timeline">{t("timeline_tab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <GeneralTab order={order} on_update={refetch} />
            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={() => set_delete_open(true)}>
                <Trash2 className="mr-1 size-4" />
                {t("delete")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="items">
            <ItemsTab order_id={order.id} items={items} adjustments={adjustments} on_update={refetch} />
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <ShippingTab order_id={order.id} shipping_address={shipping_addr} on_update={refetch} />
            <ShipmentPanel order_id={order.id} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab
              order_id={order.id}
              payment_status={order.payment_status}
              payment_provider={order.payment_provider}
              payment_reference={order.payment_reference}
              grand_total={order.grand_total}
              on_update={refetch}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesTab order_id={order.id} />
          </TabsContent>

          <TabsContent value="returns" className="space-y-4">
            <ReturnPanel order_id={order.id} items={items} order_status={order.status} on_update={refetch} />
          </TabsContent>

          <TabsContent value="operations">
            <OrderOperationsTab order_id={order.id} order_status={order.status} />
          </TabsContent>

          <TabsContent value="comments">
            <OrderCommentsTab order_id={order.id} />
          </TabsContent>

          <TabsContent value="timeline">
            <TimelineTab order_id={order.id} />
          </TabsContent>
        </Tabs>
      )}

      <DeleteOrderDialog
        order_id={order_id}
        order_number={order?.order_number ?? order_id}
        open={delete_open}
        onOpenChange={set_delete_open}
        on_deleted={() => router.push("/console/orders")}
      />
    </QueryGuard>
  );
}
