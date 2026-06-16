export const MOVEMENT_TYPES = {
  adjust: "adjust",
  receive: "receive",
  sale: "sale",
  reserve: "reserve",
  release: "release",
  preorder_allocate: "preorder_allocate",
  preorder_fulfill: "preorder_fulfill",
} as const;

export const MOVEMENT_LABELS: Record<string, string> = {
  adjust: "Ajustement",
  receive: "Réception",
  sale: "Vente",
  reserve: "Réservation",
  release: "Libération",
  preorder_allocate: "Alloc. préco.",
  preorder_fulfill: "Préco. servie",
};

export type MovementType = (typeof MOVEMENT_TYPES)[keyof typeof MOVEMENT_TYPES];

export const RESERVATION_STATUS = {
  active: "active",
  committed: "committed",
  released: "released",
  expired: "expired",
} as const;

export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const DEFAULT_WAREHOUSE_ID = "default";
