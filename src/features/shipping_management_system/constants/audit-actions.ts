export const AUDIT_ACTION = {
  SHIPMENT_CREATED: "shipment.created",
  SHIPMENT_TRACKING_SYNCED: "shipment.tracking_synced",
  DELIVERY_ATTEMPT_LOGGED: "delivery.attempt_logged",
  DELIVERY_RETRIED: "delivery.retried",
  DELIVERY_RETURNED_TO_WAREHOUSE: "delivery.returned_to_warehouse",
} as const;

export type ShippingAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
