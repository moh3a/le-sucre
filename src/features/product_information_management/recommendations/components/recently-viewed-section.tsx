"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("recommendations");
  const [sessionKey] = React.useState<string>(() => {
    let key = localStorage.getItem("ls_session_key");
    if (!key) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      key = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem("ls_session_key", key);
    }
    return key;
  });

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
        title={t("recently_viewed")}
        items={data ?? []}
        isLoading={isLoading}
      />
    </QueryGuard>
  );
}
