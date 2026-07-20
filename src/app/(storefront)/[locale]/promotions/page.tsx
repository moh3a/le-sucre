import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PromotionsPageClient } from "./promotions-page-client";
import type { AppLocale } from "@/i18n/config";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "promotions" });
  return { title: t("activeBanners") };
}

export default async function PromotionsPage({ params }: Props) {
  const { locale } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("promotions") }]} />
      <PromotionsPageClient locale={locale} />
    </>
  );
}
