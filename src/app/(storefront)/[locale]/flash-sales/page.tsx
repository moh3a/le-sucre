import { getTranslations } from "next-intl/server";
import { FlashSalesContent } from "./flash-sales-client";
import type { AppLocale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "flashSales" });
  return { title: t("activeSales") };
}

export default async function FlashSalesPage({ params }: Props) {
  const { locale } = await params;
  return <FlashSalesContent locale={locale} />;
}
