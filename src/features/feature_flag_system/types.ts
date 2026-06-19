import type { feature_flags } from "./db/schema";

export type FeatureFlag = typeof feature_flags.$inferSelect;
export type FeatureFlagInput = typeof feature_flags.$inferInsert;

export type FeatureFlagWithMeta = FeatureFlag & {
  is_stale?: boolean;
};

export type FeatureFlagStats = {
  total: number;
  enabled: number;
  disabled: number;
};
