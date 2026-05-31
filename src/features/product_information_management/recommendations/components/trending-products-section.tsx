"use client";

import { trpc } from "@/components/providers/app-providers";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";

export function TrendingProductsSection({
  locale,
  period = "day",
  limit = 10,
}: {
  locale: "fr" | "en";
  period?: "day" | "week";
  limit?: number;
}) {
  const { data, isLoading } = trpc.recommendations.trending.useQuery({
    locale,
    period,
    limit,
  });

  return (
    <ProductRecommendationCarousel
      title={locale === "fr" ? "Tendances du moment" : "Trending Products"}
      items={data ?? []}
      isLoading={isLoading}
    />
  );
}
