import type { Metadata } from "next";

import { SharedWishlistPageClient } from "@/features/wishlist_management_system/components/shared-wishlist-page-client";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return { title: "Liste de souhaits partagée" };
}

export default async function SharedWishlistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SharedWishlistPageClient token={token} />;
}
