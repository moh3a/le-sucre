import { getTranslations } from "next-intl/server";
import { Package, RotateCcw, Truck, Clock, CheckCircle, Globe } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { Link } from "@/i18n/navigation";
import { SHIPPING_METHODS } from "@/features/order_management_system/checkout/constants/shipping-methods";

type Props = {
  params: Promise<{ locale: string }>;
};

type ReturnStep = {
  icon: typeof Truck;
  titleKey: string;
  descKey: string;
};

const BADGE_BY_METHOD: Record<string, string> = {
  standard: "badge_economical",
  express: "badge_popular",
  sameday: "badge_sameday",
};

function formatCost(cost: number, locale: string, freeLabel: string) {
  if (cost === 0) return freeLabel;
  return `${new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : locale).format(cost)} DZD`;
}

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
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  const tCheckout = await getTranslations({ locale, namespace: "checkout" });

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <StorefrontBreadcrumbs
        items={[{ label: tBc("home"), href: "/" }, { label: tBc("shipping_returns") }]}
      />
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-balance">{t("title")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed text-balance">
          {t("subtitle")}
        </p>
      </section>

      <Separator />

      <section>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Globe className="text-primary mb-2 size-6" />
              <CardTitle className="font-heading text-base">{t("zoneTitle")}</CardTitle>
              <CardDescription>{t("zoneDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Truck className="text-primary mb-2 size-6" />
              <CardTitle className="font-heading text-base">{t("carrierTitle")}</CardTitle>
              <CardDescription>{t("carrierDesc")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="text-primary mb-2 size-6" />
              <CardTitle className="font-heading text-base">{t("delayTitle")}</CardTitle>
              <CardDescription>{t("delayDesc")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold text-balance">{t("methodsTitle")}</h2>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground p-4 text-left font-medium">
                    {t("methodHeader")}
                  </th>
                  <th className="text-muted-foreground p-4 text-left font-medium">
                    {t("costHeader")}
                  </th>
                  <th className="text-muted-foreground p-4 text-left font-medium">
                    {t("delayHeader")}
                  </th>
                  <th className="text-muted-foreground p-4 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {SHIPPING_METHODS.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="p-4 font-medium">{tCheckout(m.name_key)}</td>
                    <td className="p-4">{formatCost(m.cost, locale, tCheckout("free"))}</td>
                    <td className="p-4">{tCheckout(m.description_key)}</td>
                    <td className="p-4 text-right">
                      <Badge variant="secondary">{t(BADGE_BY_METHOD[m.id])}</Badge>
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
        <h2 className="mb-6 text-2xl font-bold text-balance">{t("returnPolicyTitle")}</h2>
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
        <h2 className="mb-6 text-2xl font-bold text-balance">{t("returnProcessTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {RETURN_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.titleKey}>
                <CardHeader>
                  <Icon className="text-primary mb-2 size-8" />
                  <CardTitle className="font-heading text-base">{t(step.titleKey)}</CardTitle>
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
