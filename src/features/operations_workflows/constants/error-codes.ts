import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const OPERATIONS_ERROR = {
  NOT_FOUND: {
    code: "OPERATIONS_NOT_FOUND",
    status: 404,
    message: { fr: "Ressource opérationnelle introuvable", en: "Operations resource not found", ar: "لم يتم العثور على مورد العمليات" },
  },
  UNAUTHORIZED: {
    code: "OPERATIONS_UNAUTHORIZED",
    status: 403,
    message: { fr: "Action non autorisée", en: "Unauthorized action", ar: "إجراء غير مصرح به" },
  },
  INVALID_STATUS: {
    code: "OPERATIONS_INVALID_STATUS",
    status: 409,
    message: { fr: "Statut invalide pour cette opération", en: "Invalid status for this operation", ar: "حالة غير صالحة لهذه العملية" },
  },
  ALREADY_HELD: {
    code: "OPERATIONS_ALREADY_HELD",
    status: 409,
    message: { fr: "La commande est déjà en attente", en: "Order is already on hold", ar: "الطلب معلق بالفعل" },
  },
  NOT_HELD: {
    code: "OPERATIONS_NOT_HELD",
    status: 409,
    message: { fr: "La commande n'est pas en attente", en: "Order is not on hold", ar: "الطلب ليس معلقًا" },
  },
  CANCELLATION_PENDING: {
    code: "OPERATIONS_CANCELLATION_PENDING",
    status: 409,
    message: { fr: "Une demande d'annulation est déjà en cours", en: "A cancellation request is already pending", ar: "طلب الإلغاء معلق بالفعل" },
  },
  CANNOT_ESCALATE: {
    code: "OPERATIONS_CANNOT_ESCALATE",
    status: 409,
    message: { fr: "Impossible d'escalader cette commande", en: "Cannot escalate this order", ar: "لا يمكن تصعيد هذا الطلب" },
  },
  FOLLOW_UP_NOT_FOUND: {
    code: "OPERATIONS_FOLLOW_UP_NOT_FOUND",
    status: 404,
    message: { fr: "Relance introuvable", en: "Follow-up not found", ar: "لم يتم العثور على المتابعة" },
  },
  CASE_NOT_FOUND: {
    code: "OPERATIONS_CASE_NOT_FOUND",
    status: 404,
    message: { fr: "Cas de support introuvable", en: "Support case not found", ar: "لم يتم العثور على حالة الدعم" },
  },
  TASK_NOT_FOUND: {
    code: "OPERATIONS_TASK_NOT_FOUND",
    status: 404,
    message: { fr: "Tâche introuvable", en: "Task not found", ar: "لم يتم العثور على المهمة" },
  },
  INVENTORY_ADJUSTMENT_NOT_FOUND: {
    code: "INVENTORY_ADJUSTMENT_NOT_FOUND",
    status: 404,
    message: { fr: "Demande d'ajustement introuvable", en: "Inventory adjustment request not found", ar: "لم يتم العثور على طلب التعديل" },
  },
  PROMOTION_REVIEW_NOT_FOUND: {
    code: "PROMOTION_REVIEW_NOT_FOUND",
    status: 404,
    message: { fr: "Révision de promotion introuvable", en: "Promotion review not found", ar: "لم يتم العثور على مراجعة الترويج" },
  },
  WARRANTY_NOT_FOUND: {
    code: "WARRANTY_NOT_FOUND",
    status: 404,
    message: { fr: "Demande de garantie introuvable", en: "Warranty request not found", ar: "لم يتم العثور على طلب الضمان" },
  },
  PAYMENT_VERIFICATION_NOT_FOUND: {
    code: "PAYMENT_VERIFICATION_NOT_FOUND",
    status: 404,
    message: { fr: "Vérification de paiement introuvable", en: "Payment verification not found", ar: "لم يتم العثور على التحقق من الدفع" },
  },
  REFUND_REQUEST_NOT_FOUND: {
    code: "REFUND_REQUEST_NOT_FOUND",
    status: 404,
    message: { fr: "Demande de remboursement introuvable", en: "Refund request not found", ar: "لم يتم العثور على طلب استرداد" },
  },
  INVALID_TRANSITION: {
    code: "OPERATIONS_INVALID_TRANSITION",
    status: 409,
    message: { fr: "Transition de statut invalide", en: "Invalid status transition", ar: "انتقال حالة غير صالح" },
  },
} as const satisfies Record<string, ErrorDef>;
