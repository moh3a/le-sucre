"use client";

import { trpc } from "@/components/providers/app-providers";

export function useSearchSuggestions(locale: string, q: string) {
  const enabled = q.trim().length >= 1;
  return trpc.catalog.suggestions.useQuery(
    { locale: locale as "fr" | "en" | "ar", q: q.trim(), limit: 10 },
    { enabled, staleTime: 30_000, placeholderData: (prev) => prev },
  );
}

export function useTrendingSearches(locale: string) {
  return trpc.catalog.trending.useQuery(
    { locale: locale as "fr" | "en" | "ar", limit: 10 },
    { staleTime: 60_000 },
  );
}
