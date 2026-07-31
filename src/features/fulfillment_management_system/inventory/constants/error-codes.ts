import type { ErrorDef } from "../../shared/error-codes";

export const INVENTORY_ERROR = {
  SKU_NOT_FOUND: {
    code: "SKU_NOT_FOUND",
    status: 404,
    message: {
      fr: "SKU introuvable",
      en: "SKU not found",
      ar: "SKU غير موجود",
    },
  },
  LEVEL_NOT_FOUND: {
    code: "LEVEL_NOT_FOUND",
    status: 404,
    message: {
      fr: "Niveau de stock introuvable",
      en: "Stock level not found",
      ar: "مستوى المخزون غير موجود",
    },
  },
  STOCK_INSUFFICIENT: {
    code: "STOCK_INSUFFICIENT",
    status: 409,
    message: {
      fr: "Stock insuffisant",
      en: "Insufficient stock",
      ar: "المخزون غير كاف",
    },
  },
  STOCK_BELOW_RESERVED: {
    code: "STOCK_BELOW_RESERVED",
    status: 409,
    message: {
      fr: "Le stock ne peut pas être inférieur aux réservations",
      en: "Stock cannot be less than reserved quantity",
      ar: "لا يمكن أن يكون المخزون أقل من الكمية المحجوزة",
    },
  },
  VERSION_CONFLICT: {
    code: "VERSION_CONFLICT",
    status: 409,
    message: {
      fr: "Conflit de version – veuillez réessayer",
      en: "Version conflict – please retry",
      ar: "تعارض في الإصدار – يرجى إعادة المحاولة",
    },
  },
  NEGATIVE_STOCK: {
    code: "NEGATIVE_STOCK",
    status: 409,
    message: {
      fr: "Le stock ne peut pas devenir négatif",
      en: "Stock cannot become negative",
      ar: "لا يمكن أن يصبح المخزون سالباً",
    },
  },
  RESERVATION_NOT_FOUND: {
    code: "RESERVATION_NOT_FOUND",
    status: 404,
    message: {
      fr: "Réservation introuvable",
      en: "Reservation not found",
      ar: "الحجز غير موجود",
    },
  },
  RESERVATION_NOT_ACTIVE: {
    code: "RESERVATION_NOT_ACTIVE",
    status: 409,
    message: {
      fr: "La réservation n'est plus active",
      en: "Reservation is no longer active",
      ar: "الحجز لم يعد نشطاً",
    },
  },
  RESERVATION_COMMIT_FAILED: {
    code: "RESERVATION_COMMIT_FAILED",
    status: 409,
    message: {
      fr: "Stock insuffisant pour valider la commande",
      en: "Insufficient stock to commit the order",
      ar: "مخزون غير كافٍ لتأكيد الطلب",
    },
  },
  PRODUCT_NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit introuvable",
      en: "Product not found",
      ar: "المنتج غير موجود",
    },
  },
} as const satisfies Record<string, ErrorDef>;
