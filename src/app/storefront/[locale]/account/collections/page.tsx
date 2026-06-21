import type { Metadata } from "next";

import { CustomerCollectionsPageClient } from "@/features/wishlist_management_system/components/customer-collections-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "المجموعات" : locale === "en" ? "Collections" : "Collections";
  return { title };
}

export default function CustomerCollectionsPage() {
  return <CustomerCollectionsPageClient />;
}
