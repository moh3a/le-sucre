"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";
import type { AppLocale } from "@/i18n/config";

export function SimilarProductsSection({
  product_id,
  locale,
  limit = 10,
}: {
  product_id: string;
  locale: AppLocale;
  limit?: number;
}) {
  const t = useTranslations("recommendations");
  const query = trpc.recommendations.byProduct.useQuery({
    product_id,
    locale,
    types: ["similar"],
    limit,
  });
  const { data, isLoading } = query;

  return (
    <QueryGuard query={query}>
      <ProductRecommendationCarousel
        title={t("similar_products")}
        items={data?.similar ?? []}
        isLoading={isLoading}
      />
    </QueryGuard>
  );
}
