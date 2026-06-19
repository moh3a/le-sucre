import { CustomerCollectionDetailPageClient } from "@/features/wishlist_management_system/components/customer-collection-detail-page-client";

export default async function CustomerCollectionDetailPage({ params }: { params: Promise<{ collection_id: string }> }) {
  const { collection_id } = await params;
  return <CustomerCollectionDetailPageClient collectionId={collection_id} />;
}
