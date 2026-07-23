import type { Metadata } from "next";

import { CustomerDetailTabs } from "@/features/order_management_system/customers/components/customer-detail-tabs";

type Props = { params: Promise<{ customer_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { customer_id } = await params;
  return { title: `Client ${customer_id}` };
}

export default async function CustomerDetailPage({ params }: Props) {
  const { customer_id } = await params;

  return <CustomerDetailTabs user_id={customer_id} />;
}
 