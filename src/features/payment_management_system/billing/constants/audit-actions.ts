export const AUDIT_ACTION = {
  INVOICE_GENERATED: "invoice.generated",
  REFUND_INVOICE_GENERATED: "invoice.refund_generated",
  CREDIT_NOTE_GENERATED: "invoice.credit_note_generated",
  INVOICE_MARKED_AS_PAID: "invoice.marked_as_paid",
  INVOICE_VOIDED: "invoice.voided",
  INVOICE_SOFT_DELETED: "invoice.soft_deleted",
  INVOICE_RESTORED: "invoice.restored",
  INVOICE_FORCE_DELETED: "invoice.force_deleted",
} as const;

export type BillingAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
