import type { Metadata } from "next";

import { CustomerSavedItemsPageClient } from "@/features/wishlist_management_system/components/customer-saved-items-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "المحفوظات" : locale === "en" ? "Saved items" : "Articles sauvegardés";
  return { title };
}

export default function CustomerSavedItemsPage() {
  return <CustomerSavedItemsPageClient />;
}
