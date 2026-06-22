"use client";

import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";

export function SimilarProductsSection({
  product_id,
  locale,
  limit = 10,
}: {
  product_id: string;
  locale: "fr" | "en";
  limit?: number;
}) {
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
      title={locale === "fr" ? "Produits similaires" : "Similar Products"}
      items={data?.similar ?? []}
      isLoading={isLoading}
    />
    </QueryGuard>
  );
}
