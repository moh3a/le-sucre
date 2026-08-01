export const TASK_TYPES = [
  "order_assignment",
  "shipment_assignment",
  "payment_follow_up",
  "product_creation",
  "stock_receiving",
  "order_follow_up",
  "customer_follow_up",
  "inventory_review",
  "campaign_review",
  "general",
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_TYPE_LABEL_KEYS: Record<TaskType, string> = {
  order_assignment: "type_order_assignment",
  shipment_assignment: "type_shipment_assignment",
  payment_follow_up: "type_payment_follow_up",
  product_creation: "type_product_creation",
  stock_receiving: "type_stock_receiving",
  order_follow_up: "type_order_follow_up",
  customer_follow_up: "type_customer_follow_up",
  inventory_review: "type_inventory_review",
  campaign_review: "type_campaign_review",
  general: "type_general",
};

export const REFERENCE_TYPES = [
  "order",
  "shipment",
  "payment",
  "product",
  "customer",
  "campaign",
] as const;

export type ReferenceType = (typeof REFERENCE_TYPES)[number];

export const REFERENCE_TYPE_LABEL_KEYS: Record<ReferenceType, string> = {
  order: "ref_type_order",
  shipment: "ref_type_shipment",
  payment: "ref_type_payment",
  product: "ref_type_product",
  customer: "ref_type_customer",
  campaign: "ref_type_campaign",
};

export const REFERENCE_ROUTES: Record<ReferenceType, string> = {
  order: "/console/orders/",
  shipment: "/console/shipping/",
  payment: "/console/payments/",
  product: "/console/products/",
  customer: "/console/customers/",
  campaign: "/console/campaigns/",
};

export const TASK_TYPES_WITH_COMPLETION_EFFECT = new Set([
  "order_assignment",
  "payment_follow_up",
  "product_creation",
  "campaign_review",
]);

export const TASK_COMPLETION_EFFECT_LABEL_KEYS: Record<string, string> = {
  order_assignment: "effect_confirm_order",
  payment_follow_up: "effect_capture_payment",
  product_creation: "effect_publish_product",
  campaign_review: "effect_activate_campaign",
};
