import { PaymentDetailClient } from "@/features/payment_management_system/components/payment-detail-client";

export default async function PaymentDetailPage({
  params,
}: {
  params: { payment_id: string };
}) {
  return <PaymentDetailClient paymentId={params.payment_id} />;
}
