import { getTranslations } from "next-intl/server";
import { RecentlyViewedContent } from "./recently-viewed-client";
import type { AppLocale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "recentlyViewed" });
  return { title: t("title") };
}

export default async function RecentlyViewedPage({ params }: Props) {
  const { locale } = await params;
  return <RecentlyViewedContent locale={locale} />;
}
