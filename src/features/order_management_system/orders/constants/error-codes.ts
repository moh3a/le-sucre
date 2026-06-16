import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const ORDER_ERROR = {
  NOT_FOUND: {
    code: "ORDER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Commande introuvable",
      en: "Order not found",
      ar: "الطلب غير موجود",
    },
  },
  CART_NOT_FOUND: {
    code: "ORDER_CART_NOT_FOUND",
    status: 404,
    message: {
      fr: "Panier introuvable pour la commande",
      en: "Cart not found for order placement",
      ar: "العربة غير موجودة للطلب",
    },
  },
  INVALID_STATUS_TRANSITION: {
    code: "ORDER_INVALID_STATUS_TRANSITION",
    status: 409,
    message: {
      fr: "Transition de statut de commande invalide",
      en: "Invalid order status transition",
      ar: "انتقال حالة الطلب غير صالح",
    },
  },
  ALREADY_CANCELLED: {
    code: "ORDER_ALREADY_CANCELLED",
    status: 409,
    message: {
      fr: "La commande est déjà annulée",
      en: "Order is already cancelled",
      ar: "الطلب ملغي بالفعل",
    },
  },
  ALREADY_COMPLETED: {
    code: "ORDER_ALREADY_COMPLETED",
    status: 409,
    message: {
      fr: "La commande est déjà terminée",
      en: "Order is already completed",
      ar: "الطلب مكتمل بالفعل",
    },
  },
  CANNOT_CANCEL: {
    code: "ORDER_CANNOT_CANCEL",
    status: 409,
    message: {
      fr: "La commande ne peut pas être annulée dans son statut actuel",
      en: "Order cannot be cancelled in its current status",
      ar: "لا يمكن إلغاء الطلب في حالته الحالية",
    },
  },
  PAYMENT_ALREADY_PAID: {
    code: "ORDER_PAYMENT_ALREADY_PAID",
    status: 409,
    message: {
      fr: "La commande est déjà payée",
      en: "Order is already paid",
      ar: "الطلب مدفوع بالفعل",
    },
  },
  PAYMENT_FAILED: {
    code: "ORDER_PAYMENT_FAILED",
    status: 500,
    message: {
      fr: "Échec du traitement du paiement de la commande",
      en: "Order payment processing failed",
      ar: "فشل معالجة دفع الطلب",
    },
  },
  INSUFFICIENT_STOCK: {
    code: "ORDER_INSUFFICIENT_STOCK",
    status: 409,
    message: {
      fr: "Stock insuffisant pour passer la commande",
      en: "Insufficient stock to place the order",
      ar: "مخزون غير كافٍ لتقديم الطلب",
    },
  },
  NOTES_UPDATE_FAILED: {
    code: "ORDER_NOTES_UPDATE_FAILED",
    status: 400,
    message: {
      fr: "Échec de la mise à jour des notes de commande",
      en: "Failed to update order notes",
      ar: "فشل تحديث ملاحظات الطلب",
    },
  },
  ASSIGNMENT_FAILED: {
    code: "ORDER_ASSIGNMENT_FAILED",
    status: 400,
    message: {
      fr: "Échec de l'attribution à la commande",
      en: "Failed to assign user to order",
      ar: "فشل تعيين المستخدم للطلب",
    },
  },
  OPERATOR_ALREADY_ASSIGNED: {
    code: "ORDER_OPERATOR_ALREADY_ASSIGNED",
    status: 409,
    message: {
      fr: "Opérateur déjà attribué à cette commande",
      en: "Operator already assigned to this order",
      ar: "المشغل مُخصص بالفعل لهذا الطلب",
    },
  },
  DELIVERY_PERSON_ALREADY_ASSIGNED: {
    code: "ORDER_DELIVERY_PERSON_ALREADY_ASSIGNED",
    status: 409,
    message: {
      fr: "Livreur déjà attribué à cette commande",
      en: "Delivery person already assigned to this order",
      ar: "عامل التوصيل مُخصص بالفعل لهذا الطلب",
    },
  },
  GUEST_ACCESS_DENIED: {
    code: "ORDER_GUEST_ACCESS_DENIED",
    status: 403,
    message: {
      fr: "Numéro de téléphone invalide pour l'accès à la commande invitée",
      en: "Invalid phone number for guest order access",
      ar: "رقم الهاتف غير صالح للوصول إلى طلب الضيف",
    },
  },
  STATS_FAILED: {
    code: "ORDER_ADMIN_STATS_FAILED",
    status: 500,
    message: {
      fr: "Échec de la récupération des statistiques de commandes",
      en: "Failed to retrieve order statistics",
      ar: "فشل استرداد إحصائيات الطلبات",
    },
  },
  CHART_FAILED: {
    code: "ORDER_ADMIN_CHART_FAILED",
    status: 500,
    message: {
      fr: "Échec de la récupération des données graphiques",
      en: "Failed to retrieve order chart data",
      ar: "فشل استرداد بيانات الرسم البياني للطلبات",
    },
  },
} as const satisfies Record<string, ErrorDef>;
