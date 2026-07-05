import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CustomerOrderDetailPageClient } from "@/features/order_management_system/orders/components/customer-order-detail-page-client";

type Props = { params: Promise<{ locale: string; order_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("order_title") };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;
  return <CustomerOrderDetailPageClient orderId={order_id} />;
}
