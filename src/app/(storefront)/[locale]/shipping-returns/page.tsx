import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, RotateCcw, Truck, Clock, CheckCircle, Globe } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

type ShippingMethod = {
  labelKey: string;
  cost: string;
  delay: string;
  badgeKey: string;
};

type ReturnStep = {
  icon: typeof Truck;
  titleKey: string;
  descKey: string;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shippingReturns" });
  return { title: t("title") };
}

export default async function ShippingReturnsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shippingReturns" });

  const shippingMethods: ShippingMethod[] = [
    { labelKey: "method_standard", cost: t("cost_standard"), delay: t("delay_standard"), badgeKey: "badge_economical" },
    { labelKey: "method_express", cost: t("cost_express"), delay: t("delay_express"), badgeKey: "badge_popular" },
    { labelKey: "method_relay", cost: t("cost_relay"), delay: t("delay_standard"), badgeKey: "badge_economical" },
    { labelKey: "method_free", cost: t("cost_free"), delay: t("delay_standard"), badgeKey: "badge_from" },
  ];

  const returnSteps: ReturnStep[] = [
    { icon: RotateCcw, titleKey: "step1_title", descKey: "step1_desc" },
    { icon: Package, titleKey: "step2_title", descKey: "step2_desc" },
    { icon: Truck, titleKey: "step3_title", descKey: "step3_desc" },
    { icon: CheckCircle, titleKey: "step4_title", descKey: "step4_desc" },
  ];

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
      </section>

      <Separator />

      <section>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Globe className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">{t("zoneTitle")}</CardTitle>
              <CardDescription>{t("zoneDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Truck className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">{t("carrierTitle")}</CardTitle>
              <CardDescription>{t("carrierDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">{t("delayTitle")}</CardTitle>
              <CardDescription>{t("delayDesc")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("methodsTitle")}</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground p-4 text-left font-medium">{t("methodHeader")}</th>
                  <th className="text-muted-foreground p-4 text-left font-medium">{t("costHeader")}</th>
                  <th className="text-muted-foreground p-4 text-left font-medium">{t("delayHeader")}</th>
                  <th className="text-muted-foreground p-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {shippingMethods.map((m) => (
                  <tr key={m.labelKey} className="border-b last:border-0">
                    <td className="p-4 font-medium">{t(m.labelKey)}</td>
                    <td className="p-4">{m.cost}</td>
                    <td className="p-4">{m.delay}</td>
                    <td className="p-4 text-right">
                      <Badge variant="secondary">{t(m.badgeKey)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("returnPolicyTitle")}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t("returnConditionsTitle")}</CardTitle>
            <CardDescription>{t("returnConditionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">{t("returnCondition1")}</p>
            <p className="text-muted-foreground text-sm">{t("returnCondition2")}</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("returnProcessTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {returnSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.titleKey}>
                <CardHeader>
                  <Icon className="mb-2 size-8 text-primary" />
                  <CardTitle className="text-base">{t(step.titleKey)}</CardTitle>
                  <CardDescription>{t(step.descKey)}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      <section className="text-center">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>{t("helpTitle")}</CardTitle>
            <CardDescription>{t("helpDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/contact">{t("helpContact")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/faq">{t("helpFaq")}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
