import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

import { CustomerWishlistsPageClient } from "@/features/wishlist_management_system/components/customer-wishlists-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("wishlists_title") };
}

export default async function CustomerWishlistsPage({ params }: Props) {
  const { locale } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_wishlists") }]} />
      <CustomerWishlistsPageClient />
    </>
  );
}
