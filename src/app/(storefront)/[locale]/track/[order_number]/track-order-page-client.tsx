"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Package,
  RotateCcw,
  Truck,
  CheckCircle,
  ExternalLink,
  CircleAlert,
  SearchX,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { trpc } from "@/components/providers/app-providers";
import { TrackOrderPageSkeleton } from "./track-order-page-skeleton";

interface TrackOrderPageClientProps {
  orderNumber: string;
}

const STATUS_ICONS = [Package, RotateCcw, Truck, CheckCircle] as const;
const STATUS_KEYS = [
  "stepConfirmed",
  "stepPreparing",
  "stepShipped",
  "stepDelivered",
] as const;

function getFulfillmentStep(status: string): number {
  switch (status) {
    case "delivered":
    case "completed":
      return 4;
    case "shipped":
    case "in_transit":
    case "partially_shipped":
      return 3;
    case "processing":
    case "packed":
    case "ready_to_ship":
      return 2;
    case "confirmed":
      return 1;
    default:
      return 0;
  }
}

function getDeliveryStep(delivery_status: string | null): number {
  switch (delivery_status) {
    case "delivered":
      return 4;
    case "failed":
    case "returned":
      return 4;
    case "in_transit":
    case "out_for_delivery":
      return 3;
    case "dispatched":
      return 3;
    default:
      return 0;
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "delivered":
    case "completed":
      return "default";
    case "cancelled":
    case "failed_delivery":
    case "refunded":
      return "destructive";
    case "processing":
    case "shipped":
      return "secondary";
    default:
      return "outline";
  }
}

function getStatusLabel(t: (key: string) => string, status: string): string {
  const map: Record<string, string> = {
    pending_payment: "statusPending",
    confirmed: "stepConfirmed",
    processing: "stepPreparing",
    shipped: "stepShipped",
    delivered: "stepDelivered",
    cancelled: "statusCancelled",
    refunded: "statusRefunded",
    failed_delivery: "statusFailed",
  };
  const key = map[status] ?? "statusInTransit";
  return t(key);
}

export function TrackOrderPageClient({ orderNumber }: TrackOrderPageClientProps) {
  const t = useTranslations("trackOrder");

  const { data, isLoading, error } = trpc.orders.trackOrder.useQuery({
    order_number: orderNumber,
  });

  if (isLoading) {
    return <TrackOrderPageSkeleton />;
  }

  if (error) {
    const isNotFound =
      error.data?.code === "NOT_FOUND" ||
      error.message?.toLowerCase().includes("not found");

    if (isNotFound) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t("empty_title")}</EmptyTitle>
              <EmptyDescription>{t("empty_description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-center p-6">
          <Alert variant="destructive" className="max-w-md">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <AlertTitle>{t("error_title")}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t("error_description")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t("empty_title")}</EmptyTitle>
            <EmptyDescription>{t("empty_description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const { order, items, shipment, tracking_events } = data;

  const fulfillment_completed = getFulfillmentStep(order.fulfillment_status ?? order.status);
  const delivery_completed = shipment ? getDeliveryStep(shipment.delivery_status) : 0;
  const steps_completed = Math.max(fulfillment_completed, delivery_completed);

  const trackingSteps = STATUS_KEYS.map((key, index) => {
    const completed = index < steps_completed;
    let date = "";
    if (index === 0 && order.placed_at) {
      date = new Date(order.placed_at).toLocaleDateString();
    } else if (index === 3 && shipment?.delivery_status === "delivered") {
      const deliveredEvent = tracking_events?.find(
        (e) => e.status === "delivered",
      );
      if (deliveredEvent) {
        date = new Date(deliveredEvent.occurred_at).toLocaleDateString();
      }
    } else if (index === 2 && shipment) {
      const shippedEvent = tracking_events?.find(
        (e) => e.status === "in_transit" || e.status === "dispatched",
      );
      if (shippedEvent) {
        date = new Date(shippedEvent.occurred_at).toLocaleDateString();
      }
    }

    return {
      icon: STATUS_ICONS[index],
      label: t(key),
      date: date || (completed ? t("stepPending") : ""),
      completed,
    };
  });

  const addr = order.shipping_address as Record<string, unknown> | null;

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <div className="flex items-center justify-center gap-3">
          <p className="text-muted-foreground text-lg">
            {t("orderLabel")}{" "}
            <span className="font-mono font-semibold text-foreground">
              #{order.order_number}
            </span>
          </p>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusLabel(t, order.status)}
          </Badge>
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold">{t("progressTitle")}</h2>
        <div className="space-y-0">
          {trackingSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                {index < trackingSteps.length - 1 && (
                  <div
                    className={`absolute left-[15px] top-10 h-full w-px ${
                      step.completed ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${
                    step.completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p
                    className={`text-sm font-medium ${
                      step.completed ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-muted-foreground text-xs">{step.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold">{t("itemsTitle")}</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground p-4 text-left font-medium">
                    {t("itemHeader")}
                  </th>
                  <th className="text-muted-foreground p-4 text-center font-medium">
                    {t("qtyHeader")}
                  </th>
                  <th className="text-muted-foreground p-4 text-right font-medium">
                    {t("priceHeader")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-4">{item.product_name}</td>
                    <td className="p-4 text-center">{item.quantity}</td>
                    <td className="p-4 text-right">
                      {Number(item.unit_price).toLocaleString()} {order.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-medium">
                  <td colSpan={2} className="p-4 text-right">
                    {t("totalLabel")}
                  </td>
                  <td className="p-4 text-right">
                    {Number(order.grand_total).toLocaleString()} {order.currency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </section>

      {shipment && (
        <>
          <Separator />

          <section className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="size-5 text-primary" />
                  {t("carrierTitle")}
                </CardTitle>
                <CardDescription>{t("carrierDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm">
                      {t("trackingNumber")}{" "}
                      <span className="font-mono font-medium">
                        {shipment.tracking_number ?? "—"}
                      </span>
                    </p>
                    {shipment.tracking_url && (
                      <p className="text-muted-foreground text-xs">
                        {t("estimatedDelivery")}
                      </p>
                    )}
                  </div>
                  {shipment.tracking_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={shipment.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 size-4" />
                        {t("trackOn")}
                      </a>
                    </Button>
                  )}
                </div>

                {tracking_events.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">
                      {t("progressTitle")}
                    </h4>
                    {tracking_events.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{event.status}</p>
                          {event.description && (
                            <p className="text-muted-foreground text-xs">
                              {event.description}
                            </p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            {new Date(event.occurred_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
