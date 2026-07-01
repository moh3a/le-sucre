"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";
import type { AppLocale } from "@/i18n/config";

export function TrendingProductsSection({
  locale,
  period = "day",
  limit = 10,
}: {
  locale: AppLocale;
  period?: "day" | "week";
  limit?: number;
}) {
  const query = trpc.recommendations.trending.useQuery({
    locale,
    period,
    limit,
  });
  const { data, isLoading } = query;

  return (
    <QueryGuard query={query}>
    <ProductRecommendationCarousel
      title={locale === "fr" ? "Tendances du moment" : "Trending Products"}
      items={data ?? []}
      isLoading={isLoading}
    />
    </QueryGuard>
  );
}
