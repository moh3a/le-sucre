import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const PAYMENT_ERROR = {
  NOT_FOUND: {
    code: "PAYMENT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Paiement introuvable",
      en: "Payment not found",
      ar: "الدفعة غير موجودة",
    },
  },
  TRANSACTION_NOT_FOUND: {
    code: "TRANSACTION_NOT_FOUND",
    status: 404,
    message: {
      fr: "Transaction introuvable",
      en: "Transaction not found",
      ar: "المعاملة غير موجودة",
    },
  },
  REFUND_NOT_FOUND: {
    code: "REFUND_NOT_FOUND",
    status: 404,
    message: {
      fr: "Remboursement introuvable",
      en: "Refund not found",
      ar: "استرداد الأموال غير موجود",
    },
  },
  PAYOUT_NOT_FOUND: {
    code: "PAYOUT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Paiement fournisseur introuvable",
      en: "Payout not found",
      ar: "الدفع للمورد غير موجود",
    },
  },
  ALREADY_CAPTURED: {
    code: "PAYMENT_ALREADY_CAPTURED",
    status: 409,
    message: {
      fr: "Paiement déjà capturé",
      en: "Payment already captured",
      ar: "تم بالفعل تحصيل الدفعة",
    },
  },
  ALREADY_REFUNDED: {
    code: "PAYMENT_ALREADY_REFUNDED",
    status: 409,
    message: {
      fr: "Paiement déjà remboursé",
      en: "Payment already refunded",
      ar: "تم استرداد الدفعة بالفعل",
    },
  },
  ALREADY_FAILED: {
    code: "PAYMENT_ALREADY_FAILED",
    status: 409,
    message: {
      fr: "Paiement déjà échoué",
      en: "Payment already failed",
      ar: "فشلت الدفعة بالفعل",
    },
  },
  INVALID_STATUS_TRANSITION: {
    code: "INVALID_PAYMENT_STATUS_TRANSITION",
    status: 400,
    message: {
      fr: "Transition de statut de paiement invalide",
      en: "Invalid payment status transition",
      ar: "انتقال حالة الدفع غير صالح",
    },
  },
  INVALID_AMOUNT: {
    code: "INVALID_PAYMENT_AMOUNT",
    status: 400,
    message: {
      fr: "Montant de paiement invalide",
      en: "Invalid payment amount",
      ar: "مبلغ الدفع غير صالح",
    },
  },
  REFUND_EXCEEDS_AMOUNT: {
    code: "REFUND_EXCEEDS_AMOUNT",
    status: 400,
    message: {
      fr: "Le montant du remboursement dépasse le montant de la transaction",
      en: "Refund amount exceeds transaction amount",
      ar: "مبلغ الاسترداد يتجاوز مبلغ المعاملة",
    },
  },
  REFUND_ALREADY_PROCESSED: {
    code: "REFUND_ALREADY_PROCESSED",
    status: 409,
    message: {
      fr: "Remboursement déjà traité",
      en: "Refund already processed",
      ar: "تمت معالجة الاسترداد بالفعل",
    },
  },
  REFUND_REQUIRES_APPROVAL: {
    code: "REFUND_REQUIRES_APPROVAL",
    status: 400,
    message: {
      fr: "Ce remboursement nécessite une approbation",
      en: "This refund requires approval",
      ar: "هذا الاسترداد يتطلب موافقة",
    },
  },
  PAYMENT_PROVIDER_ERROR: {
    code: "PAYMENT_PROVIDER_ERROR",
    status: 502,
    message: {
      fr: "Erreur du fournisseur de paiement",
      en: "Payment provider error",
      ar: "خطأ في مزود الدفع",
    },
  },
  PROVIDER_NOT_SUPPORTED: {
    code: "PAYMENT_PROVIDER_NOT_SUPPORTED",
    status: 400,
    message: {
      fr: "Fournisseur de paiement non supporté",
      en: "Payment provider not supported",
      ar: "مزود الدفع غير مدعوم",
    },
  },
  PROVIDER_NOT_CONFIGURED: {
    code: "PAYMENT_PROVIDER_NOT_CONFIGURED",
    status: 500,
    message: {
      fr: "Fournisseur de paiement non configuré",
      en: "Payment provider not configured",
      ar: "مزود الدفع غير مهيأ",
    },
  },
  DUPLICATE_IDEMPOTENCY_KEY: {
    code: "DUPLICATE_IDEMPOTENCY_KEY",
    status: 409,
    message: {
      fr: "Clé d'idempotence en double",
      en: "Duplicate idempotency key",
      ar: "مفتاح التكرار مكرر",
    },
  },
  PARTIAL_PAYMENT_NOT_FOUND: {
    code: "PARTIAL_PAYMENT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Paiement partiel introuvable",
      en: "Partial payment not found",
      ar: "الدفع الجزئي غير موجود",
    },
  },
  INSTALLMENT_NOT_FOUND: {
    code: "INSTALLMENT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Échéance introuvable",
      en: "Installment not found",
      ar: "القسط غير موجود",
    },
  },
  INSTALLMENT_ALREADY_PAID: {
    code: "INSTALLMENT_ALREADY_PAID",
    status: 409,
    message: {
      fr: "Cette échéance est déjà payée",
      en: "This installment is already paid",
      ar: "هذا القسط مدفوع بالفعل",
    },
  },
  PAYOUT_ALREADY_PROCESSED: {
    code: "PAYOUT_ALREADY_PROCESSED",
    status: 409,
    message: {
      fr: "Paiement fournisseur déjà traité",
      en: "Payout already processed",
      ar: "تمت معالجة الدفع للمورد بالفعل",
    },
  },
  MAX_RETRIES_EXCEEDED: {
    code: "MAX_RETRIES_EXCEEDED",
    status: 400,
    message: {
      fr: "Nombre maximum de tentatives dépassé",
      en: "Maximum retries exceeded",
      ar: "تجاوز الحد الأقصى لعدد المحاولات",
    },
  },
  INVALID_WEBHOOK_SIGNATURE: {
    code: "INVALID_WEBHOOK_SIGNATURE",
    status: 401,
    message: {
      fr: "Signature webhook invalide",
      en: "Invalid webhook signature",
      ar: "توقيع webhook غير صالح",
    },
  },
  WEBHOOK_PROCESSING_FAILED: {
    code: "WEBHOOK_PROCESSING_FAILED",
    status: 500,
    message: {
      fr: "Échec du traitement du webhook",
      en: "Webhook processing failed",
      ar: "فشل معالجة webhook",
    },
  },
  ORDER_NOT_ELIGIBLE: {
    code: "ORDER_NOT_ELIGIBLE",
    status: 400,
    message: {
      fr: "La commande n'est pas éligible au paiement",
      en: "Order is not eligible for payment",
      ar: "الطلب غير مؤهل للدفع",
    },
  },
  PARTIAL_PAYMENT_NOT_ELIGIBLE: {
    code: "PARTIAL_PAYMENT_NOT_ELIGIBLE",
    status: 400,
    message: {
      fr: "La commande n'est pas éligible au paiement partiel",
      en: "Order is not eligible for partial payment",
      ar: "الطلب غير مؤهل للدفع الجزئي",
    },
  },
} as const satisfies Record<string, ErrorDef>;
