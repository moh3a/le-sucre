export const ORDER_STATUS = {
  pending_payment: "pending_payment",
  confirmed: "confirmed",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  refunded: "refunded",
} as const;

export const PAYMENT_STATUS = {
  pending: "pending",
  authorized: "authorized",
  paid: "paid",
  failed: "failed",
  refunded: "refunded",
} as const;

export const FULFILLMENT_STATUS = {
  unfulfilled: "unfulfilled",
  partial: "partial",
  fulfilled: "fulfilled",
  returned: "returned",
} as const;

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};
