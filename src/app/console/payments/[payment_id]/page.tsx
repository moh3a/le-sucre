import type { Metadata } from "next";

import { PaymentDetailClient } from "@/features/payment_management_system/components/payment-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ payment_id: string }> }): Promise<Metadata> {
  const { payment_id } = await params;
  return { title: `Paiement ${payment_id}` };
}

export default async function PaymentDetailPage({
  params,
}: {
  params: { payment_id: string };
}) {
  return <PaymentDetailClient paymentId={params.payment_id} />;
}
