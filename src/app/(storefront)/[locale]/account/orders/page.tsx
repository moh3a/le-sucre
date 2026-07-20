import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CustomerOrdersPageClient } from "@/features/order_management_system/orders/components/customer-orders-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });
  return { title: t("my_orders") };
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_orders") }]} />
      <CustomerOrdersPageClient />
    </>
  );
}
