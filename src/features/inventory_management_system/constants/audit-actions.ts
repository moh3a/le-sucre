export const AUDIT_ACTION = {
  WAREHOUSE_CREATED: "warehouse.create",
  WAREHOUSE_UPDATED: "warehouse.update",
  INVENTORY_STOCK_ADJUSTED: "inventory.adjust_stock",
  INVENTORY_STOCK_SET: "inventory.set_stock",
  INVENTORY_STOCK_RECEIVED: "inventory.receive_stock",
  INVENTORY_RESERVATION_CREATED: "inventory.reservation.create",
  INVENTORY_RESERVATION_RELEASED: "inventory.reservation.release",
  INVENTORY_RESERVATION_COMMITTED: "inventory.reservation.commit",
  DEMAND_FORECAST_RECOMPUTED: "forecasting.demand-forecast.recompute_sku",
  FORECASTING_EVALUATED: "forecasting.evaluate-sku",
} as const;

export type InventoryAuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
