import { getTranslations } from "next-intl/server";
import { CustomerReturnsPageClient } from "@/features/order_management_system/return_replacement/components/customer-returns-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

export const metadata = { title: "My Returns" };

type Props = { params: Promise<{ locale: string }> };

export default async function ReturnsPage({ params }: Props) {
  const { locale } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_returns") }]} />
      <CustomerReturnsPageClient />
    </>
  );
}
