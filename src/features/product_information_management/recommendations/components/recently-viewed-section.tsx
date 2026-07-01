"use client";

import * as React from "react";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";
import type { AppLocale } from "@/i18n/config";

export function RecentlyViewedSection({
  locale,
  limit = 10,
}: {
  locale: AppLocale;
  limit?: number;
}) {
  const [sessionKey, setSessionKey] = React.useState<string>("");

  React.useEffect(() => {
    let key = localStorage.getItem("ls_session_key");
    if (!key) {
      key = Math.random().toString(36).substring(2, 18);
      localStorage.setItem("ls_session_key", key);
    }
    setSessionKey(key);
  }, []);

  const query = trpc.recommendations.recent.useQuery(
    {
      locale,
      session_key: sessionKey || undefined,
      limit,
    },
    {
      enabled: Boolean(sessionKey),
    },
  );
  const { data, isLoading } = query;

  return (
    <QueryGuard query={query}>
      <ProductRecommendationCarousel
        title={locale === "fr" ? "Récemment consultés" : "Recently Viewed"}
        items={data ?? []}
        isLoading={isLoading}
      />
    </QueryGuard>
  );
}
