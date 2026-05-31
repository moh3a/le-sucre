"use client";

import { trpc } from "@/components/providers/app-providers";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";

export function RecommendedForYouSection({
  locale,
  limit = 10,
}: {
  locale: "fr" | "en";
  limit?: number;
}) {
  const { data, isLoading, error } = trpc.recommendations.forYou.useQuery(
    { locale, limit },
    {
      retry: false, // Don't spam retries if unauthenticated
    },
  );

  if (error) return null; // Gracefully hide if unauthenticated or error

  return (
    <ProductRecommendationCarousel
      title={locale === "fr" ? "Recommandé pour vous" : "Recommended For You"}
      items={data ?? []}
      isLoading={isLoading}
    />
  );
}
