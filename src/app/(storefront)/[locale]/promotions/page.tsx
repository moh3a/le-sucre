import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PromotionsPageClient } from "./promotions-page-client";
import type { AppLocale } from "@/i18n/config";

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
  return <PromotionsPageClient locale={locale} />;
}
