import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const PROMOTION_ERROR = {
  NOT_FOUND: {
    code: "PROMOTION_NOT_FOUND",
    status: 404,
    message: {
      fr: "Promotion introuvable",
      en: "Promotion not found",
      ar: "الترويج غير موجود",
    },
  },
  SLUG_CONFLICT: {
    code: "PROMOTION_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une promotion avec ce slug existe déjà",
      en: "A promotion with this slug already exists",
      ar: "يوجد ترويج بهذا المعرف بالفعل",
    },
  },
  DATE_RANGE_INVALID: {
    code: "PROMOTION_DATE_RANGE_INVALID",
    status: 400,
    message: {
      fr: "La date de début doit être antérieure à la date de fin",
      en: "Start date must be before end date",
      ar: "يجب أن يكون تاريخ البدء قبل تاريخ الانتهاء",
    },
  },
  ALREADY_ACTIVE: {
    code: "PROMOTION_ALREADY_ACTIVE",
    status: 409,
    message: {
      fr: "La promotion est déjà active",
      en: "Promotion is already active",
      ar: "الترويج نشط بالفعل",
    },
  },
  ALREADY_INACTIVE: {
    code: "PROMOTION_ALREADY_INACTIVE",
    status: 409,
    message: {
      fr: "La promotion est déjà inactive",
      en: "Promotion is already inactive",
      ar: "الترويج غير نشط بالفعل",
    },
  },
  CANNOT_DELETE_ACTIVE: {
    code: "PROMOTION_CANNOT_DELETE_ACTIVE",
    status: 409,
    message: {
      fr: "Impossible de supprimer une promotion active",
      en: "Cannot delete an active promotion",
      ar: "لا يمكن حذف ترويج نشط",
    },
  },
  DISCOUNT_EXCEEDS_MAXIMUM: {
    code: "PROMOTION_DISCOUNT_EXCEEDS_MAXIMUM",
    status: 400,
    message: {
      fr: "La remise dépasse le montant maximum autorisé",
      en: "Discount exceeds maximum allowed amount",
      ar: "الخصم يتجاوز الحد الأقصى المسموح به",
    },
  },
  RULE_INVALID: {
    code: "PROMOTION_RULE_INVALID",
    status: 400,
    message: {
      fr: "Règle de promotion invalide",
      en: "Invalid promotion rule",
      ar: "قاعدة الترويج غير صالحة",
    },
  },
  SCHEDULER_FLASH_NOT_FOUND: {
    code: "PROMOTION_SCHEDULER_FLASH_NOT_FOUND",
    status: 404,
    message: {
      fr: "Vente flash introuvable pour la planification",
      en: "Flash sale not found for scheduling",
      ar: "البيع السريع غير موجود للجدولة",
    },
  },
  SCHEDULER_JOB_FAILED: {
    code: "PROMOTION_SCHEDULER_JOB_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'exécution de la tâche programmée",
      en: "Scheduled promotion job execution failed",
      ar: "فشل تنفيذ مهمة الترويج المجدولة",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const FLASH_SALE_ERROR = {
  NOT_FOUND: {
    code: "FLASH_SALE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Vente flash introuvable",
      en: "Flash sale not found",
      ar: "البيع السريع غير موجود",
    },
  },
  EXPIRED: {
    code: "FLASH_SALE_EXPIRED",
    status: 410,
    message: {
      fr: "La vente flash a expiré",
      en: "Flash sale has expired",
      ar: "انتهى البيع السريع",
    },
  },
  NOT_STARTED: {
    code: "FLASH_SALE_NOT_STARTED",
    status: 400,
    message: {
      fr: "La vente flash n'a pas encore commencé",
      en: "Flash sale has not started yet",
      ar: "لم يبدأ البيع السريع بعد",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const CART_DISCOUNT_ERROR = {
  PROMO_CODE_NOT_FOUND: {
    code: "CART_DISCOUNT_PROMO_CODE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Code promo introuvable",
      en: "Promo code not found",
      ar: "الرمز الترويجي غير موجود",
    },
  },
  PROMO_CODE_EXPIRED: {
    code: "CART_DISCOUNT_PROMO_CODE_EXPIRED",
    status: 410,
    message: {
      fr: "Le code promo a expiré",
      en: "Promo code has expired",
      ar: "انتهت صلاحية الرمز الترويجي",
    },
  },
  PROMO_CODE_USAGE_EXCEEDED: {
    code: "CART_DISCOUNT_PROMO_CODE_USAGE_EXCEEDED",
    status: 409,
    message: {
      fr: "Limite d'utilisation du code promo dépassée",
      en: "Promo code usage limit exceeded",
      ar: "تم تجاوز حد استخدام الرمز الترويجي",
    },
  },
  MINIMUM_NOT_MET: {
    code: "CART_DISCOUNT_MINIMUM_NOT_MET",
    status: 400,
    message: {
      fr: "Montant minimum de commande non atteint pour ce code promo",
      en: "Minimum order amount not met for this promo code",
      ar: "لم يتم استيفاء الحد الأدنى لمبلغ الطلب لهذا الرمز الترويجي",
    },
  },
  CUSTOMER_EXCLUDED: {
    code: "CART_DISCOUNT_CUSTOMER_EXCLUDED",
    status: 403,
    message: {
      fr: "Le client n'est pas éligible à ce code promo",
      en: "Customer is not eligible for this promo code",
      ar: "العميل غير مؤهل لهذا الرمز الترويجي",
    },
  },
  CATEGORY_EXCLUDED: {
    code: "CART_DISCOUNT_CATEGORY_EXCLUDED",
    status: 400,
    message: {
      fr: "Le code promo ne s'applique pas aux articles de cette catégorie",
      en: "Promo code does not apply to items in this category",
      ar: "لا ينطبق الرمز الترويجي على عناصر هذه الفئة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
