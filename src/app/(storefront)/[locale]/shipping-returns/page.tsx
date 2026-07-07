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
  costKey: string;
  delayKey: string;
  badgeKey: string;
};

type ReturnStep = {
  icon: typeof Truck;
  titleKey: string;
  descKey: string;
};

const SHIPPING_METHODS: ShippingMethod[] = [
  { labelKey: "method_standard", costKey: "cost_standard", delayKey: "delay_standard", badgeKey: "badge_economical" },
  { labelKey: "method_express", costKey: "cost_express", delayKey: "delay_express", badgeKey: "badge_popular" },
  { labelKey: "method_relay", costKey: "cost_relay", delayKey: "delay_standard", badgeKey: "badge_economical" },
  { labelKey: "method_free", costKey: "cost_free", delayKey: "delay_standard", badgeKey: "badge_from" },
] as const;

const RETURN_STEPS: ReturnStep[] = [
  { icon: RotateCcw, titleKey: "step1_title", descKey: "step1_desc" },
  { icon: Package, titleKey: "step2_title", descKey: "step2_desc" },
  { icon: Truck, titleKey: "step3_title", descKey: "step3_desc" },
  { icon: CheckCircle, titleKey: "step4_title", descKey: "step4_desc" },
] as const;

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shippingReturns" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ShippingReturnsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shippingReturns" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-balance text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance leading-relaxed">
          {t("subtitle")}
        </p>
      </section>

      <Separator />

      <section>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Globe className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base font-heading">{t("zoneTitle")}</CardTitle>
              <CardDescription>{t("zoneDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Truck className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base font-heading">{t("carrierTitle")}</CardTitle>
              <CardDescription>{t("carrierDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base font-heading">{t("delayTitle")}</CardTitle>
              <CardDescription>{t("delayDesc")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-balance text-2xl font-bold">{t("methodsTitle")}</h2>
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
                {SHIPPING_METHODS.map((m) => (
                  <tr key={m.labelKey} className="border-b last:border-0">
                    <td className="p-4 font-medium">{t(m.labelKey)}</td>
                    <td className="p-4">{t(m.costKey)}</td>
                    <td className="p-4">{t(m.delayKey)}</td>
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
        <h2 className="mb-6 text-balance text-2xl font-bold">{t("returnPolicyTitle")}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t("returnConditionsTitle")}</CardTitle>
            <CardDescription>{t("returnConditionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm leading-relaxed">{t("returnCondition1")}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{t("returnCondition2")}</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-balance text-2xl font-bold">{t("returnProcessTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {RETURN_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.titleKey}>
                <CardHeader>
                  <Icon className="mb-2 size-8 text-primary" />
                  <CardTitle className="text-base font-heading">{t(step.titleKey)}</CardTitle>
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
