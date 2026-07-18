import type { Metadata } from "next";

import { PromotionDetailClient } from "@/features/order_management_system/promotions/components/promotion-detail-client";

type Props = { params: Promise<{ promotion_id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { promotion_id } = await params;
  return { title: `Promotion ${promotion_id}` };
}

export default async function PromotionDetailPage({ params }: Props) {
  const { promotion_id } = await params;

  return (
    <div className="container p-6">
      <PromotionDetailClient promotion_id={promotion_id} />
    </div>
  );
}