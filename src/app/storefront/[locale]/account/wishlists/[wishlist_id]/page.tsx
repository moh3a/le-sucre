import { CustomerWishlistDetailPageClient } from "@/features/wishlist_management_system/components/customer-wishlist-detail-page-client";

export default async function CustomerWishlistDetailPage({ params }: { params: Promise<{ wishlist_id: string }> }) {
  const { wishlist_id } = await params;
  return <CustomerWishlistDetailPageClient wishlistId={wishlist_id} />;
}
