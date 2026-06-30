import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CustomerWishlistsPageClient } from "@/features/wishlist_management_system/components/customer-wishlists-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("wishlists_title") };
}

export default function CustomerWishlistsPage() {
  return <CustomerWishlistsPageClient />;
}
