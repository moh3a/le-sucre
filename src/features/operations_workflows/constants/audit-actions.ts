export const AUDIT_ACTION = {
  ORDER_ROUTED: "order.routed",
  PAYMENT_RECONCILIATION_MATCHED: "payment_reconciliation.matched",
  PURCHASE_ORDER_CREATED: "purchase_order.created",
  PURCHASE_ORDER_SUBMITTED: "purchase_order.submitted",
  PURCHASE_ORDER_APPROVED: "purchase_order.approved",
  PURCHASE_ORDER_RECEIVED: "purchase_order.received",
  INVENTORY_TRANSFER_CREATED: "inventory_transfer.created",
  INVENTORY_TRANSFER_APPROVED: "inventory_transfer.approved",
  INVENTORY_TRANSFER_SHIPPED: "inventory_transfer.shipped",
  INVENTORY_TRANSFER_RECEIVED: "inventory_transfer.received",
  INVENTORY_TRANSFER_CANCELLED: "inventory_transfer.cancelled",
  RMA_ISSUED: "rma.issued",
  RMA_LABEL_GENERATED: "rma.label_generated",
  RMA_RECEIVED: "rma.received",
  RMA_INSPECTED: "rma.inspected",
  RMA_COMPLETED: "rma.completed",
  SLA_RESOLVED: "sla.resolved",
  SLA_ESCALATED: "sla.escalated",
  FRAUD_REVIEW_FLAGGED: "fraud_review.flagged",
  APPROVAL_SUBMITTED: "approval.submitted",
  APPROVAL_APPROVED: "approval.approved",
  APPROVAL_REJECTED: "approval.rejected",
} as const;

export type OperationsAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

export function fraud_review_action(decision: string) {
  return `fraud_review.${decision}` as const;
}

export function approval_action(prefix: "submitted" | "approved" | "rejected", entity_type: string) {
  return `approval.${prefix}.${entity_type}` as const;
}
