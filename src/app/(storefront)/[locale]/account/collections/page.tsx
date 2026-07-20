import { getTranslations } from "next-intl/server";
import { CustomerCollectionsPageClient } from "@/features/wishlist_management_system/components/customer-collections-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("my_collections") };
}

export default async function CustomerCollectionsPage({ params }: Props) {
  const { locale } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_collections") }]} />
      <CustomerCollectionsPageClient />
    </>
  );
}
