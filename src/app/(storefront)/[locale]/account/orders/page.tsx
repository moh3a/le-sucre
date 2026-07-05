import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CustomerOrdersPageClient } from "@/features/order_management_system/orders/components/customer-orders-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });
  return { title: t("my_orders") };
}

export default function OrdersPage() {
  return <CustomerOrdersPageClient />;
}
