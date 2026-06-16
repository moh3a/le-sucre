export const RETURN_REQUEST_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  in_transit: "in_transit",
  received: "received",
  completed: "completed",
  cancelled: "cancelled",
} as const;

export const RETURN_REQUEST_TYPE = {
  return: "return",
  replacement: "replacement",
  failed_delivery: "failed_delivery",
} as const;

export const RETURN_REQUEST_TYPE_LABELS: Record<string, string> = {
  return: "Retour",
  replacement: "Remplacement",
  failed_delivery: "Livraison échouée",
};

export const RETURN_REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  in_transit: "En transit",
  received: "Reçu",
  completed: "Terminé",
  cancelled: "Annulé",
};

export const RETURN_REQUEST_STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  in_transit: "secondary",
  received: "secondary",
  completed: "default",
  cancelled: "destructive",
};
