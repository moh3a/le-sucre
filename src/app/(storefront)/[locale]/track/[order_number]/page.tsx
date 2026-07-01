import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, RotateCcw, Truck, CheckCircle, ExternalLink } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; order_number: string }>;
};

type TrackingStep = {
  icon: typeof Package;
  labelKey: string;
  date: string;
  completed: boolean;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "trackOrder" });
  return { title: t("title") };
}

const ORDER_ITEMS = [
  { name: "Macarons assortis (x12)", quantity: 2, price: "2 400 DZD" },
  { name: "Gâteau au chocolat", quantity: 1, price: "2 800 DZD" },
  { name: "Meringues (x6)", quantity: 1, price: "1 200 DZD" },
];

export default async function TrackOrderPage({ params }: Props) {
  const { locale, order_number } = await params;
  const t = await getTranslations({ locale, namespace: "trackOrder" });

  const trackingSteps: TrackingStep[] = [
    { icon: Package, labelKey: "stepConfirmed", date: "28 juin 2026", completed: true },
    { icon: RotateCcw, labelKey: "stepPreparing", date: "29 juin 2026", completed: true },
    { icon: Truck, labelKey: "stepShipped", date: "30 juin 2026", completed: true },
    { icon: CheckCircle, labelKey: "stepDelivered", date: t("stepPending"), completed: false },
  ];

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      {/* TRACKING HEADER */}
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <div className="flex items-center justify-center gap-3">
          <p className="text-muted-foreground text-lg">
            {t("orderLabel")} <span className="font-mono font-semibold text-foreground">#{order_number}</span>
          </p>
          <Badge variant="secondary">{t("statusInTransit")}</Badge>
        </div>
      </section>

      <Separator />

      {/* TRACKING TIMELINE */}
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold">{t("progressTitle")}</h2>
        <div className="space-y-0">
          {trackingSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.labelKey} className="relative flex gap-4 pb-8 last:pb-0">
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
                    {t(step.labelKey)}
                  </p>
                  <p className="text-muted-foreground text-xs">{step.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* ORDER ITEMS */}
      <section className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-2xl font-bold">{t("itemsTitle")}</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground p-4 text-left font-medium">{t("itemHeader")}</th>
                  <th className="text-muted-foreground p-4 text-center font-medium">{t("qtyHeader")}</th>
                  <th className="text-muted-foreground p-4 text-right font-medium">{t("priceHeader")}</th>
                </tr>
              </thead>
              <tbody>
                {ORDER_ITEMS.map((item) => (
                  <tr key={item.name} className="border-b last:border-0">
                    <td className="p-4">{item.name}</td>
                    <td className="p-4 text-center">{item.quantity}</td>
                    <td className="p-4 text-right">{item.price}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-medium">
                  <td colSpan={2} className="p-4 text-right">
                    {t("totalLabel")}
                  </td>
                  <td className="p-4 text-right">6 400 DZD</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* CARRIER INFO */}
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
                  {t("trackingNumber")} <span className="font-mono font-medium">YL-{order_number}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("estimatedDelivery")}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 size-4" />
                  {t("trackOn")}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
