// types.ts
import type { CatalogProductCard } from "@/features/product_information_management/catalog_discovery/types";

export type ScoredCandidate = {
  product_id: string;
  score: number;
  signals: Record<string, number>;
};

export type RecommendationItem = CatalogProductCard & {
  score: number;
  recommendation_type: string;
};

export type RecommendationContext = {
  locale: string;
  user_id?: string | null;
  session_key?: string | null;
  limit?: number;
};
