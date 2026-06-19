import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const ORDER_OPERATIONS_ERROR = {
  NOT_FOUND: { code: "OPERATIONS_NOT_FOUND", status: 404, message: { fr: "Ressource opérationnelle introuvable", en: "Operations resource not found", ar: "لم يتم العثور على مورد العمليات" } },
  INVALID_STATUS: { code: "OPERATIONS_INVALID_STATUS", status: 409, message: { fr: "Statut invalide pour cette opération", en: "Invalid status for this operation", ar: "حالة غير صالحة لهذه العملية" } },
  ALREADY_HELD: { code: "OPERATIONS_ALREADY_HELD", status: 409, message: { fr: "La commande est déjà en attente", en: "Order is already on hold", ar: "الطلب معلق بالفعل" } },
  NOT_HELD: { code: "OPERATIONS_NOT_HELD", status: 409, message: { fr: "La commande n'est pas en attente", en: "Order is not on hold", ar: "الطلب ليس معلقًا" } },
  CANCELLATION_PENDING: { code: "OPERATIONS_CANCELLATION_PENDING", status: 409, message: { fr: "Une demande d'annulation est déjà en cours", en: "A cancellation request is already pending", ar: "طلب الإلغاء معلق بالفعل" } },
  CANNOT_ESCALATE: { code: "OPERATIONS_CANNOT_ESCALATE", status: 409, message: { fr: "Impossible d'escalader cette commande", en: "Cannot escalate this order", ar: "لا يمكن تصعيد هذا الطلب" } },
  INVALID_TRANSITION: { code: "OPERATIONS_INVALID_TRANSITION", status: 409, message: { fr: "Transition de statut invalide", en: "Invalid status transition", ar: "انتقال حالة غير صالح" } },
} as const satisfies Record<string, ErrorDef>;
