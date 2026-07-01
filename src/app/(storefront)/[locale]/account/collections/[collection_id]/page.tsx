import { getTranslations } from "next-intl/server";
import { CustomerCollectionDetailPageClient } from "@/features/wishlist_management_system/components/customer-collection-detail-page-client";

type Props = { params: Promise<{ locale: string; collection_id: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, collection_id } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("collection_detail_title", { id: collection_id }) };
}

export default async function CustomerCollectionDetailPage({ params }: { params: Promise<{ collection_id: string }> }) {
  const { collection_id } = await params;
  return <CustomerCollectionDetailPageClient collectionId={collection_id} />;
}
