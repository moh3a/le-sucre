import type { Metadata } from "next";

import { CustomerWishlistDetailPageClient } from "@/features/wishlist_management_system/components/customer-wishlist-detail-page-client";

type Props = { params: Promise<{ locale: string; wishlist_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, wishlist_id } = await params;
  const prefix = locale === "ar" ? "قائمة الأمنيات" : locale === "en" ? "Wishlist" : "Liste de souhaits";
  return { title: `${prefix} ${wishlist_id}` };
}

export default async function CustomerWishlistDetailPage({ params }: { params: Promise<{ wishlist_id: string }> }) {
  const { wishlist_id } = await params;
  return <CustomerWishlistDetailPageClient wishlistId={wishlist_id} />;
}
