"use client";

import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ORDER_LABELS, STATUS_BADGE } from "../constants/order-status";
import { OrderDetailPageSkeleton } from "./order-detail-page-skeleton";

const TIMELINE_STEPS = [
  { key: "confirmed", tKey: "step_confirmed" },
  { key: "processing", tKey: "step_prepared" },
  { key: "shipped", tKey: "step_shipped" },
  { key: "delivered", tKey: "step_delivered" },
];

const STATUS_ORDER_SCORE: Record<string, number> = {
  pending_payment: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  failed_delivery: -1,
  cancelled: -1,
  refunded: -1,
};

export function CustomerOrderDetailPageClient({
  orderId,
}: {
  orderId: string;
}) {
  const t = useTranslations("account");
  const query = trpc.orders.myOrderById.useQuery({ order_id: orderId });

  return (
    <QueryGuard
      query={{ isLoading: query.isLoading, error: query.error }}
      loadingFallback={<OrderDetailPageSkeleton />}
    >
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <Button variant="ghost" asChild>
          <Link href="/account/orders">
            <span className="mr-1">&larr;</span>
            {t("back_to_orders")}
          </Link>
        </Button>
        <section>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <p className="text-xl font-semibold">
                  {t("order_title")} {query.data?.order.order_number ?? orderId}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("order_date")}:{" "}
                  {query.data?.order.placed_at
                    ? new Date(query.data.order.placed_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              {query.data && (
                <Badge
                  variant={
                    STATUS_BADGE[query.data.order.status] ?? "secondary"
                  }
                >
                  {ORDER_LABELS[query.data.order.status] ??
                    query.data.order.status}
                </Badge>
              )}
            </CardHeader>
          </Card>
        </section>
        <section>
          <Card>
            <CardHeader>
              <p className="text-lg font-semibold">
                {t("order_progress")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("order_progress_desc")}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {TIMELINE_STEPS.map((step, index) => {
                  const currentScore =
                    query.data
                      ? STATUS_ORDER_SCORE[query.data.order.status]
                      : 0;
                  const stepScore = STATUS_ORDER_SCORE[step.key] ?? 0;
                  const isReached = currentScore >= stepScore;
                  return (
                    <div
                      key={step.key}
                      className="flex flex-1 items-center last:flex-none"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full text-sm font-medium",
                            isReached
                              ? "bg-primary text-primary-foreground"
                              : "border text-muted-foreground",
                          )}
                        >
                          {index + 1}
                        </div>
                        <span className="mt-1 text-xs">
                          {t(step.tKey)}
                        </span>
                      </div>
                      {index < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={cn(
                            "mx-2 h-px flex-1",
                            isReached ? "bg-primary" : "bg-border",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
        <Separator />
        <section>
          <Card>
            <CardHeader>
              <p className="text-lg font-semibold">
                {t("order_items")}
              </p>
            </CardHeader>
            <CardContent>
              {query.data && query.data.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b text-left">
                        <th className="pb-2 font-medium">{t("product")}</th>
                        <th className="pb-2 font-medium">{t("quantity")}</th>
                        <th className="pb-2 text-right font-medium">
                          {t("price")}
                        </th>
                        <th className="pb-2 text-right font-medium">
                          {t("subtotal")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {query.data.items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-muted flex size-12 items-center justify-center rounded-md">
                                <Package className="size-5 text-muted-foreground/60" />
                              </div>
                              <span className="font-medium">
                                {item.product_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">{item.quantity}</td>
                          <td className="py-3 text-right">
                            {Number(item.unit_price).toLocaleString()}{" "}
                            {item.currency}
                          </td>
                          <td className="py-3 text-right font-medium">
                            {Number(item.line_total).toLocaleString()}{" "}
                            {item.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center">
                  Aucun article
                </p>
              )}
            </CardContent>
          </Card>
        </section>
        <Separator />
        <section className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-lg font-semibold">
                {t("shipping_info")}
              </p>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {(() => {
                const raw = query.data?.order.shipping_address;
                const addr = raw && typeof raw === "object" ? (raw as Record<string, string | null>) : null;
                if (!addr) {
                  return (
                    <p className="text-muted-foreground">
                      Non renseignée
                    </p>
                  );
                }
                const fullName = addr.full_name ?? null;
                const line1 = addr.line1 ?? null;
                const line2 = addr.line2 ?? null;
                const postalCode = addr.postal_code ?? null;
                const city = addr.city ?? null;
                const countryCode = addr.country_code ?? null;
                const phone = addr.phone ?? null;
                return (
                  <>
                    {fullName && <p className="font-medium">{fullName}</p>}
                    {line1 && <p>{line1}</p>}
                    {line2 && <p>{line2}</p>}
                    <p>{[postalCode, city].filter(Boolean).join(" ")}</p>
                    {countryCode && <p>{countryCode}</p>}
                    {phone && <p className="pt-2">{phone}</p>}
                  </>
                );
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-lg font-semibold">
                {t("shipping_method")}
              </p>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {query.data?.order.shipment_provider ? (
                <>
                  <p className="font-medium">
                    {query.data.order.shipment_provider}
                  </p>
                  {query.data.order.shipment_reference && (
                    <p className="text-muted-foreground text-xs">
                      Réf: {query.data.order.shipment_reference}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium">
                    {t("standard_shipping")}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("estimated_delivery")}: 3-5 jours ouvrés
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </section>
        <Separator />
        <section className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-lg font-semibold">
                {t("payment_info")}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t("payment_method")}</span>
                <span className="font-medium">
                  {query.data?.order.payment_provider ?? "—"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>{t("payment_status")}</span>
                <Badge
                  variant={
                    query.data?.order.payment_status === "paid"
                      ? "default"
                      : "secondary"
                  }
                >
                  {query.data?.order.payment_status === "paid"
                    ? t("payment_paid")
                    : (query.data?.order.payment_status ?? "—")}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-lg font-semibold">
                {t("total_breakdown")}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t("subtotal")}</span>
                <span>
                  {query.data
                    ? `${Number(query.data.order.subtotal).toLocaleString()} ${query.data.order.currency}`
                    : "—"}
                </span>
              </div>
              {query.data && Number(query.data.order.discount_total) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>
                    -
                    {Number(
                      query.data.order.discount_total,
                    ).toLocaleString()}{" "}
                    {query.data.order.currency}
                  </span>
                </div>
              )}
              {query.data && Number(query.data.order.tax_total) > 0 && (
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>
                    {Number(query.data.order.tax_total).toLocaleString()}{" "}
                    {query.data.order.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t("shipping_cost")}</span>
                <span>
                  {query.data
                    ? `${Number(query.data.order.shipping_total).toLocaleString()} ${query.data.order.currency}`
                    : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("total")}</span>
                <span>
                  {query.data
                    ? `${Number(query.data.order.grand_total).toLocaleString()} ${query.data.order.currency}`
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
        <Separator />
        <section className="flex flex-wrap gap-3">
          <Button>{t("reorder")}</Button>
          <Button variant="outline">
            {t("request_return")}
          </Button>
          <Button variant="outline">
            {t("download_invoice")}
          </Button>
        </section>
      </div>
    </QueryGuard>
  );
}
