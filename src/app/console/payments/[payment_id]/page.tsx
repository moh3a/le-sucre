import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaymentDetailClient } from "@/features/payment_management_system/components/payment-detail-client";

type PageProps = { params: Promise<{ payment_id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { payment_id } = await params;
  return { title: `Paiement ${payment_id}` };
}

export default async function PaymentDetailPage({ params }: PageProps) {
  const { payment_id } = await params;
  if (!payment_id) notFound();

  return <PaymentDetailClient paymentId={payment_id} />;
}
