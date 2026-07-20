import { getTranslations } from "next-intl/server";
import { CustomerCollectionDetailPageClient } from "@/features/wishlist_management_system/components/customer-collection-detail-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = { params: Promise<{ locale: string; collection_id: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, collection_id } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("collection_detail_title", { id: collection_id }) };
}

export default async function CustomerCollectionDetailPage({ params }: { params: Promise<{ locale: string; collection_id: string }> }) {
  const { locale, collection_id } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_collections"), href: "/account/collections" }, { label: tBc("detail") }]} />
      <CustomerCollectionDetailPageClient collectionId={collection_id} />
    </>
  );
}
