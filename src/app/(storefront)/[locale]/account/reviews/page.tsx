import type { Metadata } from "next";

import { CustomerReviewsPageClient } from "@/features/product_reviews_management/components/customer-reviews-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "تقييماتي" : locale === "en" ? "My reviews" : "Mes avis";
  return { title };
}

export default function CustomerReviewsPage() {
  return <CustomerReviewsPageClient />;
}