import { getTranslations } from "next-intl/server";
import { CustomerReviewsPageClient } from "@/features/product_reviews_management/components/customer-reviews-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return { title: t("my_reviews") };
}

export default async function CustomerReviewsPage({ params }: Props) {
  const { locale } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_reviews") }]} />
      <CustomerReviewsPageClient />
    </>
  );
}
