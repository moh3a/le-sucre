export const PREORDER_ALLOCATION_STATUS = {
  pending: "pending",
  confirmed: "confirmed",
  fulfilled: "fulfilled",
  cancelled: "cancelled",
} as const;

export const PREORDER_LINE_STATUS = {
  pending_stock: "pending_stock",
  allocated: "allocated",
  ready_to_ship: "ready_to_ship",
  fulfilled: "fulfilled",
  cancelled: "cancelled",
} as const;

export const FULFILLMENT_TYPE = {
  standard: "standard",
  preorder: "preorder",
  backorder: "backorder",
} as const;
