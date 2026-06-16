import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const SHIPPING_ERROR = {
  ORDER_NOT_FOUND: {
    code: "SHIPPING_ORDER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Commande introuvable",
      en: "Order not found",
      ar: "الطلب غير موجود",
    },
  },
  SHIPMENT_NOT_FOUND: {
    code: "SHIPPING_SHIPMENT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Expédition introuvable",
      en: "Shipment not found",
      ar: "الشحنة غير موجودة",
    },
  },
  ALREADY_EXISTS: {
    code: "SHIPPING_ALREADY_EXISTS",
    status: 409,
    message: {
      fr: "Expédition déjà existante pour cette commande",
      en: "Shipment already exists for this order",
      ar: "الشحنة موجودة بالفعل لهذا الطلب",
    },
  },
  TRACKING_MISSING: {
    code: "SHIPPING_TRACKING_MISSING",
    status: 400,
    message: {
      fr: "Numéro de suivi manquant",
      en: "Tracking number is missing",
      ar: "رقم التتبع مفقود",
    },
  },
  PROVIDER_NOT_FOUND: {
    code: "SHIPPING_PROVIDER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Transporteur introuvable",
      en: "Shipping provider not found",
      ar: "شركة الشحن غير موجودة",
    },
  },
  PROVIDER_ERROR: {
    code: "SHIPPING_PROVIDER_ERROR",
    status: 502,
    message: {
      fr: "Le transporteur a retourné une erreur",
      en: "Shipping provider returned an error",
      ar: "أرجعت شركة الشحن خطأً",
    },
  },
  PROVIDER_TIMEOUT: {
    code: "SHIPPING_PROVIDER_TIMEOUT",
    status: 504,
    message: {
      fr: "La requête au transporteur a expiré",
      en: "Shipping provider request timed out",
      ar: "انتهت مهلة طلب شركة الشحن",
    },
  },
  QUOTE_FAILED: {
    code: "SHIPPING_QUOTE_FAILED",
    status: 502,
    message: {
      fr: "Échec de l'obtention du devis de livraison",
      en: "Failed to get shipping quote from provider",
      ar: "فشل الحصول على عرض أسعار الشحن",
    },
  },
  CREATION_FAILED: {
    code: "SHIPPING_CREATION_FAILED",
    status: 502,
    message: {
      fr: "Échec de la création de l'expédition chez le transporteur",
      en: "Failed to create shipment with provider",
      ar: "فشل إنشاء الشحنة لدى شركة الشحن",
    },
  },
  TRACKING_SYNC_FAILED: {
    code: "SHIPPING_TRACKING_SYNC_FAILED",
    status: 502,
    message: {
      fr: "Échec de la synchronisation du suivi depuis le transporteur",
      en: "Failed to sync tracking from provider",
      ar: "فشل مزامنة التتبع من شركة الشحن",
    },
  },
  NO_SHIPMENT_FOR_ORDER: {
    code: "SHIPPING_NO_SHIPMENT_FOR_ORDER",
    status: 404,
    message: {
      fr: "Aucune expédition trouvée pour cette commande",
      en: "No shipment found for this order",
      ar: "لا توجد شحنة لهذا الطلب",
    },
  },
  INVALID_PROVIDER_NAME: {
    code: "SHIPPING_INVALID_PROVIDER_NAME",
    status: 400,
    message: {
      fr: "Nom du transporteur invalide",
      en: "Invalid shipping provider name",
      ar: "اسم شركة الشحن غير صالح",
    },
  },
  WEBHOOK_INVALID_SIGNATURE: {
    code: "SHIPPING_WEBHOOK_INVALID_SIGNATURE",
    status: 401,
    message: {
      fr: "Signature webhook invalide",
      en: "Invalid webhook signature",
      ar: "توقيع webhook غير صالح",
    },
  },
  WEBHOOK_UNKNOWN_PROVIDER: {
    code: "SHIPPING_WEBHOOK_UNKNOWN_PROVIDER",
    status: 400,
    message: {
      fr: "Fournisseur webhook inconnu",
      en: "Unknown webhook provider",
      ar: "موفر webhook غير معروف",
    },
  },
  WEBHOOK_SHIPMENT_NOT_FOUND: {
    code: "SHIPPING_WEBHOOK_SHIPMENT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Expédition introuvable pour l'événement webhook",
      en: "Shipment not found for webhook event",
      ar: "الشحنة غير موجودة لحدث webhook",
    },
  },
  WEBHOOK_PROCESSING_FAILED: {
    code: "SHIPPING_WEBHOOK_PROCESSING_FAILED",
    status: 500,
    message: {
      fr: "Échec du traitement de la charge utile webhook",
      en: "Failed to process webhook payload",
      ar: "فشل معالجة حمولة webhook",
    },
  },
  JOB_ENQUEUE_FAILED: {
    code: "SHIPPING_JOB_ENQUEUE_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'ajout à la file de synchronisation",
      en: "Failed to enqueue tracking sync job",
      ar: "فشل إضافة مهمة مزامنة التتبع",
    },
  },
  JOB_RUNNER_FAILED: {
    code: "SHIPPING_JOB_RUNNER_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'exécution du planificateur d'expédition",
      en: "Shipping job runner execution failed",
      ar: "فشل تنفيذ مشغل مهام الشحن",
    },
  },
} as const satisfies Record<string, ErrorDef>;
