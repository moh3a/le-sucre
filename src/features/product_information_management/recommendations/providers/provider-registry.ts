// providers/provider-registry.ts
import "server-only";
import { env } from "@/config/env";
import type { RecommendationProvider } from "./recommendation-provider.interface";
import { local_recommendation_provider } from "./local-recommendation.provider";

const providers: Record<string, RecommendationProvider> = {
  local: local_recommendation_provider,
  // future: vertex: vertex_recommendation_provider,
};

export function get_recommendation_provider(): RecommendationProvider {
  const key = env.RECOMMENDATION_PROVIDER ?? "local";
  return providers[key] ?? local_recommendation_provider;
}
