export const AUDIT_ACTION = {
  MEDIA_UPLOADED: "media.upload",
  MEDIA_DELETED: "media.delete",
  MEDIA_ATTACHED: "media.attach",
  MEDIA_DETACHED: "media.detach",
} as const;

export type MediaAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
