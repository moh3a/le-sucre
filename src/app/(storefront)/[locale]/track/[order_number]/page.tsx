import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TrackOrderPageClient } from "./track-order-page-client";

type Props = {
  params: Promise<{ locale: string; order_number: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "trackOrder" });
  return { title: t("title") };
}

export default async function TrackOrderPage({ params }: Props) {
  const { locale, order_number } = await params;
  return <TrackOrderPageClient orderNumber={order_number} />;
}
