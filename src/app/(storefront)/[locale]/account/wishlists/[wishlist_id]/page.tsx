import { getTranslations } from "next-intl/server";

import { CustomerWishlistDetailPageClient } from "@/features/wishlist_management_system/components/customer-wishlist-detail-page-client";

type Props = { params: Promise<{ locale: string; wishlist_id: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, wishlist_id } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("detail_title", { id: wishlist_id }) };
}

export default async function CustomerWishlistDetailPage({
  params,
}: {
  params: Promise<{ wishlist_id: string }>;
}) {
  const { wishlist_id } = await params;
  return <CustomerWishlistDetailPageClient wishlistId={wishlist_id} />;
}
