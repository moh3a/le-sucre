"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";
import type { AppLocale } from "@/i18n/config";

export function RelatedProductsSection({
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
    types: ["related"],
    limit,
  });
  const { data, isLoading } = query;

  return (
    <QueryGuard query={query}>
      <ProductRecommendationCarousel
        title={t("you_might_also_like")}
        items={data?.related ?? []}
        isLoading={isLoading}
      />
    </QueryGuard>
  );
}
