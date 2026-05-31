"use client";

import * as React from "react";
import { trpc } from "@/components/providers/app-providers";
import { ProductRecommendationCarousel } from "./product-recommendation-carousel";

export function RecentlyViewedSection({
  locale,
  limit = 10,
}: {
  locale: "fr" | "en";
  limit?: number;
}) {
  const [sessionKey, setSessionKey] = React.useState<string>("");

  React.useEffect(() => {
    // Access localStorage safely on the client
    let key = localStorage.getItem("ls_session_key");
    if (!key) {
      key = Math.random().toString(36).substring(2, 18);
      localStorage.setItem("ls_session_key", key);
    }
    setSessionKey(key);
  }, []);

  const { data, isLoading } = trpc.recommendations.recent.useQuery(
    {
      locale,
      session_key: sessionKey || undefined,
      limit,
    },
    {
      enabled: Boolean(sessionKey), // Only query when sessionKey is loaded
    },
  );

  return (
    <ProductRecommendationCarousel
      title={locale === "fr" ? "Récemment consultés" : "Recently Viewed"}
      items={data ?? []}
      isLoading={isLoading}
    />
  );
}
