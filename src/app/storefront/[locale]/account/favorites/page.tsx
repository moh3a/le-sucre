import type { Metadata } from "next";

import { CustomerFavoritesPageClient } from "@/features/wishlist_management_system/components/customer-favorites-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "المفضلة" : locale === "en" ? "Favorites" : "Favoris";
  return { title };
}

export default function CustomerFavoritesPage() {
  return <CustomerFavoritesPageClient />;
}
