export const AUDIT_ACTION = {
  FEATURE_FLAG_CREATED: "feature_flag.create",
  FEATURE_FLAG_UPDATED: "feature_flag.update",
  FEATURE_FLAG_ENABLED: "feature_flag.enable",
  FEATURE_FLAG_DISABLED: "feature_flag.disable",
  FEATURE_FLAG_DELETED: "feature_flag.delete",
} as const;

export type FeatureFlagAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
