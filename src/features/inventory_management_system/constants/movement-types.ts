export const MOVEMENT_TYPES = {
  adjust: "adjust",
  receive: "receive",
  sale: "sale",
  reserve: "reserve",
  release: "release",
} as const;

export type MovementType = (typeof MOVEMENT_TYPES)[keyof typeof MOVEMENT_TYPES];

export const RESERVATION_STATUS = {
  active: "active",
  committed: "committed",
  released: "released",
  expired: "expired",
} as const;

export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const DEFAULT_WAREHOUSE_ID = "default";
