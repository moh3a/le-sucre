import type { Metadata } from "next";

import { CustomerWishlistsPageClient } from "@/features/wishlist_management_system/components/customer-wishlists-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "قائمة الأمنيات" : locale === "en" ? "Wishlists" : "Listes de souhaits";
  return { title };
}

export default function CustomerWishlistsPage() {
  return <CustomerWishlistsPageClient />;
}
