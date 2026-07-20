import { getTranslations } from "next-intl/server";
import { BrandDetailClient } from "./brand-detail-client";
import type { AppLocale } from "@/i18n/config";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "brandDetail" });
  return { title: t("meta_title", { brand: t("brand"), name: slug.replace(/-/g, " ") }) };
}

export default async function BrandDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("brands"), href: "/brands" }, { label: slug.replace(/-/g, " ") }]} />
      <BrandDetailClient slug={slug} locale={locale as AppLocale} />
    </>
  );
}
