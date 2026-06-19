export const NOTIFICATION_TYPES = {
  ORDER_CREATED: "order_created",
  ORDER_ASSIGNED: "order_assigned",
  ORDER_SHIPPED: "order_shipped",
  ORDER_DELIVERED: "order_delivered",
  ORDER_ESCALATED: "order_escalated",
  ORDER_HELD: "order_held",
  ORDER_RELEASED: "order_released",
  ORDER_CANCELLATION_REQUESTED: "order_cancellation_requested",

  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",

  CALLBACK_REMINDER: "callback_reminder",
  SUPPORT_CASE_ASSIGNED: "support_case_assigned",
  SUPPORT_CASE_UPDATED: "support_case_updated",

  PROMOTION_REVIEW_NEEDED: "promotion_review_needed",
  PROMOTION_APPROVED: "promotion_approved",
  CAMPAIGN_ACTIVATED: "campaign_activated",

  TASK_ASSIGNED: "task_assigned",
  TASK_DUE: "task_due",
  TASK_COMPLETED: "task_completed",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_PRIORITY: Record<string, "low" | "normal" | "high" | "urgent"> = {
  [NOTIFICATION_TYPES.ORDER_ESCALATED]: "urgent",
  [NOTIFICATION_TYPES.ORDER_HELD]: "high",
  [NOTIFICATION_TYPES.OUT_OF_STOCK]: "urgent",
  [NOTIFICATION_TYPES.LOW_STOCK]: "high",
  [NOTIFICATION_TYPES.ORDER_CANCELLATION_REQUESTED]: "high",
  [NOTIFICATION_TYPES.SUPPORT_CASE_ASSIGNED]: "normal",
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: "normal",
  [NOTIFICATION_TYPES.PROMOTION_REVIEW_NEEDED]: "normal",
  [NOTIFICATION_TYPES.CALLBACK_REMINDER]: "low",
};

export const NOTIFICATION_MESSAGES: Record<string, { title: string; message: string }> = {
  [NOTIFICATION_TYPES.ORDER_CREATED]: {
    title: "Nouvelle commande",
    message: "Une nouvelle commande a été créée",
  },
  [NOTIFICATION_TYPES.ORDER_ASSIGNED]: {
    title: "Commande assignée",
    message: "Une commande vous a été assignée",
  },
  [NOTIFICATION_TYPES.ORDER_SHIPPED]: {
    title: "Commande expédiée",
    message: "La commande a été expédiée",
  },
  [NOTIFICATION_TYPES.ORDER_DELIVERED]: {
    title: "Commande livrée",
    message: "La commande a été livrée avec succès",
  },
  [NOTIFICATION_TYPES.ORDER_ESCALATED]: {
    title: "Commande escaladée",
    message: "Une commande a été escaladée",
  },
  [NOTIFICATION_TYPES.ORDER_HELD]: {
    title: "Commande en attente",
    message: "Une commande a été mise en attente",
  },
  [NOTIFICATION_TYPES.LOW_STOCK]: {
    title: "Stock faible",
    message: "Un produit atteint un niveau de stock faible",
  },
  [NOTIFICATION_TYPES.OUT_OF_STOCK]: {
    title: "Rupture de stock",
    message: "Un produit est en rupture de stock",
  },
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: {
    title: "Nouvelle tâche",
    message: "Une tâche vous a été assignée",
  },
  [NOTIFICATION_TYPES.TASK_DUE]: {
    title: "Tâche due",
    message: "Une tâche arrive à échéance",
  },
  [NOTIFICATION_TYPES.PROMOTION_REVIEW_NEEDED]: {
    title: "Approbation requise",
    message: "Une promotion nécessite votre approbation",
  },
  [NOTIFICATION_TYPES.CALLBACK_REMINDER]: {
    title: "Rappel de rappel",
    message: "Un rappel client est programmé",
  },
  [NOTIFICATION_TYPES.SUPPORT_CASE_ASSIGNED]: {
    title: "Cas support assigné",
    message: "Un cas de support vous a été assigné",
  },
};
