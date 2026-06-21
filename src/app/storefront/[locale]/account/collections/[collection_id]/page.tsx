import type { Metadata } from "next";

import { CustomerCollectionDetailPageClient } from "@/features/wishlist_management_system/components/customer-collection-detail-page-client";

type Props = { params: Promise<{ locale: string; collection_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, collection_id } = await params;
  const prefix = locale === "ar" ? "مجموعة" : locale === "en" ? "Collection" : "Collection";
  return { title: `${prefix} ${collection_id}` };
}

export default async function CustomerCollectionDetailPage({ params }: { params: Promise<{ collection_id: string }> }) {
  const { collection_id } = await params;
  return <CustomerCollectionDetailPageClient collectionId={collection_id} />;
}
