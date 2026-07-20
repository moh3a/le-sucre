import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TrackOrderPageClient } from "./track-order-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

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
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("track_order") }]} />
      <TrackOrderPageClient orderNumber={order_number} />
    </>
  );
}
