import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const RETURN_REPLACEMENT_ERROR = {
  NOT_FOUND: {
    code: "RETURN_REQUEST_NOT_FOUND",
    status: 404,
    message: {
      fr: "Demande de retour introuvable",
      en: "Return request not found",
      ar: "طلب الإرجاع غير موجود",
    },
  },
  ORDER_NOT_DELIVERED: {
    code: "RETURN_ORDER_NOT_DELIVERED",
    status: 409,
    message: {
      fr: "La commande doit être livrée pour demander un retour",
      en: "Order must be delivered to request a return",
      ar: "يجب تسليم الطلب لطلب الإرجاع",
    },
  },
  ALREADY_HAS_PENDING_REQUEST: {
    code: "RETURN_ALREADY_HAS_PENDING",
    status: 409,
    message: {
      fr: "Une demande de retour est déjà en cours pour cette commande",
      en: "A return request is already pending for this order",
      ar: "طلب إرجاع معلق بالفعل لهذا الطلب",
    },
  },
  CANNOT_APPROVE: {
    code: "RETURN_CANNOT_APPROVE",
    status: 409,
    message: {
      fr: "Cette demande ne peut pas être approuvée dans son statut actuel",
      en: "This request cannot be approved in its current status",
      ar: "لا يمكن الموافقة على هذا الطلب في حالته الحالية",
    },
  },
  CANNOT_REJECT: {
    code: "RETURN_CANNOT_REJECT",
    status: 409,
    message: {
      fr: "Cette demande ne peut pas être rejetée dans son statut actuel",
      en: "This request cannot be rejected in its current status",
      ar: "لا يمكن رفض هذا الطلب في حالته الحالية",
    },
  },
  CANNOT_CANCEL: {
    code: "RETURN_CANNOT_CANCEL",
    status: 409,
    message: {
      fr: "Cette demande ne peut pas être annulée dans son statut actuel",
      en: "This request cannot be cancelled in its current status",
      ar: "لا يمكن إلغاء هذا الطلب في حالته الحالية",
    },
  },
  REPLACEMENT_ORDER_FAILED: {
    code: "RETURN_REPLACEMENT_ORDER_FAILED",
    status: 500,
    message: {
      fr: "Échec de la création de la commande de remplacement",
      en: "Failed to create replacement order",
      ar: "فشل إنشاء طلب الاستبدال",
    },
  },
  INVALID_ITEMS: {
    code: "RETURN_INVALID_ITEMS",
    status: 400,
    message: {
      fr: "Les articles de retour sont invalides",
      en: "Return items are invalid",
      ar: "عناصر الإرجاع غير صالحة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
