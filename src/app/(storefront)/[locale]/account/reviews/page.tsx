import { getTranslations } from "next-intl/server";
import { CustomerReviewsPageClient } from "@/features/product_reviews_management/components/customer-reviews-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return { title: t("my_reviews") };
}

export default function CustomerReviewsPage() {
  return <CustomerReviewsPageClient />;
}
