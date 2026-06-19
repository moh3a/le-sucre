import { SharedWishlistPageClient } from "@/features/wishlist_management_system/components/shared-wishlist-page-client";

export default async function SharedWishlistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedWishlistPageClient token={token} />;
}
