export const AUDIT_ACTION = {
  CONTACT_SUBMITTED: "contact.submitted",
} as const;

export type ContactAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
