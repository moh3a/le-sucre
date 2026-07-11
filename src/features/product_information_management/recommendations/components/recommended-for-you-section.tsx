"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";
import type { AppLocale } from "@/i18n/config";

export function RecommendedForYouSection({
  locale,
  limit = 10,
}: {
  locale: AppLocale;
  limit?: number;
}) {
  const t = useTranslations("recommendations");
  const query = trpc.recommendations.forYou.useQuery(
    { locale, limit },
    {
      retry: false,
    },
  );
  const { data, isLoading, error } = query;

  if (error) return null;

  return (
    <QueryGuard query={query}>
      <ProductRecommendationCarousel
        title={t("recommended_for_you")}
        items={data ?? []}
        isLoading={isLoading}
      />
    </QueryGuard>
  );
}
