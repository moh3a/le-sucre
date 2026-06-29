export const MOVEMENT_TYPES = {
  adjust: "adjust",
  receive: "receive",
  sale: "sale",
  reserve: "reserve",
  release: "release",
  preorder_allocate: "preorder_allocate",
  preorder_fulfill: "preorder_fulfill",
} as const;

export function getMovementLabels(t: (key: string) => string): Record<string, string> {
  return {
    adjust: t("adjust_stock"),
    receive: t("receive_quantity"),
    sale: t("sku_count"),
    reserve: t("reserved"),
    release: t("stock_value"),
    preorder_allocate: t("sku_count"),
    preorder_fulfill: t("stock_received"),
  };
}

export type MovementType = (typeof MOVEMENT_TYPES)[keyof typeof MOVEMENT_TYPES];

export const RESERVATION_STATUS = {
  active: "active",
  committed: "committed",
  released: "released",
  expired: "expired",
} as const;

export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const DEFAULT_WAREHOUSE_ID = "default";
