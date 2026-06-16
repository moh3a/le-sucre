export const ORDER_STATUS = {
  pending_payment: "pending_payment",
  confirmed: "confirmed",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  failed_delivery: "failed_delivery",
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
  shipped: ["delivered", "failed_delivery", "cancelled"],
  delivered: ["refunded", "failed_delivery"],
  failed_delivery: ["processing", "cancelled", "refunded"],
  cancelled: [],
  refunded: [],
};

export const ORDER_LABELS: Record<string, string> = {
  pending_payment: "En attente de paiement",
  confirmed: "Confirmée",
  processing: "En cours",
  shipped: "Expédiée",
  delivered: "Livrée",
  failed_delivery: "Livraison échouée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pending: "En attente",
  authorized: "Autorisé",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

export const FULFILLMENT_LABELS: Record<string, string> = {
  unfulfilled: "Non expédié",
  partial: "Partiel",
  fulfilled: "Expédié",
  returned: "Retourné",
};

export const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending_payment: "outline",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  failed_delivery: "destructive",
  cancelled: "destructive",
  refunded: "destructive",
};

export const PAYMENT_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  authorized: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "destructive",
};

export const FULFILLMENT_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  unfulfilled: "outline",
  partial: "secondary",
  fulfilled: "default",
  returned: "destructive",
};

export const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "authorized", label: "Autorisé" },
  { value: "paid", label: "Payé" },
  { value: "failed", label: "Échoué" },
  { value: "refunded", label: "Remboursé" },
];
