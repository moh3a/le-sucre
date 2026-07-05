import { getTranslations } from "next-intl/server";
import { BestSellersContent } from "./best-sellers-client";
import type { AppLocale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bestSellers" });
  return { title: t("title") };
}

export default async function BestSellersPage({ params }: Props) {
  const { locale } = await params;
  return <BestSellersContent locale={locale} />;
}
