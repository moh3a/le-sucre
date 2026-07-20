import { getTranslations } from "next-intl/server";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

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
  params: Promise<{ locale: string; wishlist_id: string }>;
}) {
  const { locale, wishlist_id } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_wishlists"), href: "/account/wishlists" }, { label: tBc("detail") }]} />
      <CustomerWishlistDetailPageClient wishlistId={wishlist_id} />
    </>
  );
}
