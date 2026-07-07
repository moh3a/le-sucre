import { getTranslations } from "next-intl/server";
import { BrandDetailClient } from "./brand-detail-client";
import type { AppLocale } from "@/i18n/config";

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
  return <BrandDetailClient slug={slug} locale={locale as AppLocale} />;
}
