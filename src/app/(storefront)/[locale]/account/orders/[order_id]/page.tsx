import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CustomerOrderDetailPageClient } from "@/features/order_management_system/orders/components/customer-order-detail-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = { params: Promise<{ locale: string; order_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("order_title") };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; order_id: string }>;
}) {
  const { locale, order_id } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account"), href: "/account" }, { label: tBc("my_orders"), href: "/account/orders" }, { label: tBc("detail") }]} />
      <CustomerOrderDetailPageClient orderId={order_id} />
    </>
  );
}
