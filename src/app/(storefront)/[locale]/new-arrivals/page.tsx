import { getTranslations } from "next-intl/server";
import { NewArrivalsContent } from "./new-arrivals-client";
import type { AppLocale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newArrivals" });
  return { title: t("title") };
}

export default async function NewArrivalsPage({ params }: Props) {
  const { locale } = await params;
  return <NewArrivalsContent locale={locale} />;
}
