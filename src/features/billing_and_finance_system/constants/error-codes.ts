import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const INVOICE_ERROR = {
  NOT_FOUND: {
    code: "INVOICE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Facture introuvable",
      en: "Invoice not found",
      ar: "الفاتورة غير موجودة",
    },
  },
  ORDER_NOT_FOUND: {
    code: "INVOICE_ORDER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Commande introuvable pour la génération de facture",
      en: "Order not found for invoice generation",
      ar: "الطلب غير موجود لإنشاء الفاتورة",
    },
  },
  ALREADY_EXISTS: {
    code: "INVOICE_ALREADY_EXISTS",
    status: 409,
    message: {
      fr: "La facture existe déjà pour cette commande",
      en: "Invoice already exists for this order",
      ar: "الفاتورة موجودة بالفعل لهذا الطلب",
    },
  },
  ALREADY_PAID: {
    code: "INVOICE_ALREADY_PAID",
    status: 409,
    message: {
      fr: "La facture est déjà payée",
      en: "Invoice is already paid",
      ar: "الفاتورة مدفوعة بالفعل",
    },
  },
  ALREADY_VOID: {
    code: "INVOICE_ALREADY_VOID",
    status: 409,
    message: {
      fr: "La facture est déjà annulée",
      en: "Invoice is already void",
      ar: "الفاتورة ملغاة بالفعل",
    },
  },
  CANNOT_VOID_PAID: {
    code: "INVOICE_CANNOT_VOID_PAID",
    status: 409,
    message: {
      fr: "Impossible d'annuler une facture payée",
      en: "Cannot void a paid invoice",
      ar: "لا يمكن إلغاء فاتورة مدفوعة",
    },
  },
  ITEM_NOT_IN_ORDER: {
    code: "INVOICE_ITEM_NOT_IN_ORDER",
    status: 400,
    message: {
      fr: "L'article SKU ne fait pas partie de cette commande",
      en: "Item SKU is not part of this order",
      ar: "عنصر SKU ليس جزءاً من هذا الطلب",
    },
  },
  NUMBER_GENERATION_FAILED: {
    code: "INVOICE_NUMBER_GENERATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de la génération du numéro de facture",
      en: "Failed to generate invoice number",
      ar: "فشل توليد رقم الفاتورة",
    },
  },
  PDF_GENERATION_FAILED: {
    code: "INVOICE_PDF_GENERATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de la génération du PDF",
      en: "PDF generation failed",
      ar: "فشل إنشاء PDF",
    },
  },
  EMAIL_DELIVERY_FAILED: {
    code: "INVOICE_EMAIL_DELIVERY_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'envoi de la facture par email",
      en: "Invoice email delivery failed",
      ar: "فشل إرسال الفاتورة عبر البريد الإلكتروني",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const TAX_ERROR = {
  INVALID_RATE: {
    code: "TAX_INVALID_RATE",
    status: 400,
    message: {
      fr: "Taux de taxe invalide",
      en: "Invalid tax rate provided",
      ar: "معدل الضريبة غير صالح",
    },
  },
  CALCULATION_FAILED: {
    code: "TAX_CALCULATION_FAILED",
    status: 500,
    message: {
      fr: "Échec du calcul de la taxe",
      en: "Tax calculation failed",
      ar: "فشل حساب الضريبة",
    },
  },
  ITEM_MISMATCH: {
    code: "TAX_ITEM_MISMATCH",
    status: 400,
    message: {
      fr: "Incohérence du nombre d'articles dans le calcul de la taxe",
      en: "Item count mismatch in tax calculation",
      ar: "عدم تطابق عدد العناصر في حساب الضريبة",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const PDF_ERROR = {
  GENERATION_FAILED: {
    code: "PDF_GENERATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de la génération du document PDF",
      en: "PDF document generation failed",
      ar: "فشل إنشاء مستند PDF",
    },
  },
  INVALID_TEMPLATE_DATA: {
    code: "PDF_INVALID_TEMPLATE_DATA",
    status: 400,
    message: {
      fr: "Données de facture invalides pour le modèle PDF",
      en: "Invalid invoice data for PDF template",
      ar: "بيانات الفاتورة غير صالحة لقالب PDF",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const EMAIL_ERROR = {
  SEND_FAILED: {
    code: "EMAIL_SEND_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'envoi de l'email",
      en: "Failed to send email",
      ar: "فشل إرسال البريد الإلكتروني",
    },
  },
  INVALID_ADDRESS: {
    code: "EMAIL_INVALID_ADDRESS",
    status: 400,
    message: {
      fr: "Adresse email invalide",
      en: "Invalid email address",
      ar: "عنوان البريد الإلكتروني غير صالح",
    },
  },
  QUEUE_FAILED: {
    code: "EMAIL_QUEUE_FAILED",
    status: 500,
    message: {
      fr: "Échec de la mise en file d'attente de l'email",
      en: "Failed to queue email for delivery",
      ar: "فشل وضع البريد الإلكتروني في قائمة الانتظار",
    },
  },
} as const satisfies Record<string, ErrorDef>;
