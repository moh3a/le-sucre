import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const CART_ERROR = {
  NOT_FOUND: {
    code: "CART_NOT_FOUND",
    status: 404,
    message: {
      fr: "Panier introuvable",
      en: "Cart not found",
      ar: "العربة غير موجودة",
    },
  },
  ITEM_NOT_FOUND: {
    code: "CART_ITEM_NOT_FOUND",
    status: 404,
    message: {
      fr: "Article du panier introuvable",
      en: "Cart item not found",
      ar: "عنصر العربة غير موجود",
    },
  },
  SKU_NOT_FOUND: {
    code: "CART_SKU_NOT_FOUND",
    status: 404,
    message: {
      fr: "SKU introuvable",
      en: "SKU not found",
      ar: "SKU غير موجود",
    },
  },
  SKU_INACTIVE: {
    code: "CART_SKU_INACTIVE",
    status: 400,
    message: {
      fr: "SKU n'est plus actif",
      en: "SKU is no longer active",
      ar: "SKU لم يعد نشطاً",
    },
  },
  SKU_OUT_OF_STOCK: {
    code: "CART_SKU_OUT_OF_STOCK",
    status: 409,
    message: {
      fr: "SKU en rupture de stock",
      en: "SKU is out of stock",
      ar: "SKU نفد من المخزون",
    },
  },
  QUANTITY_EXCEEDS_STOCK: {
    code: "CART_QUANTITY_EXCEEDS_STOCK",
    status: 409,
    message: {
      fr: "La quantité demandée dépasse le stock disponible",
      en: "Requested quantity exceeds available stock",
      ar: "الكمية المطلوبة تتجاوز المخزون المتاح",
    },
  },
  QUANTITY_INVALID: {
    code: "CART_QUANTITY_INVALID",
    status: 400,
    message: {
      fr: "La quantité doit être supérieure à zéro",
      en: "Quantity must be greater than zero",
      ar: "يجب أن تكون الكمية أكبر من الصفر",
    },
  },
  QUANTITY_EXCEEDS_LIMIT: {
    code: "CART_QUANTITY_EXCEEDS_LIMIT",
    status: 400,
    message: {
      fr: "La quantité dépasse le maximum autorisé par article",
      en: "Quantity exceeds maximum allowed per item",
      ar: "الكمية تتجاوز الحد الأقصى المسموح به لكل عنصر",
    },
  },
  MERGE_FAILED: {
    code: "CART_MERGE_FAILED",
    status: 500,
    message: {
      fr: "Échec de la fusion du panier invité avec le panier utilisateur",
      en: "Failed to merge guest cart with user cart",
      ar: "فشل دمج عربة الضيف مع عربة المستخدم",
    },
  },
  PREORDER_NOT_AVAILABLE: {
    code: "CART_PREORDER_NOT_AVAILABLE",
    status: 400,
    message: {
      fr: "La précommande n'est pas disponible pour ce SKU",
      en: "Preorder is not available for this SKU",
      ar: "الطلب المسبق غير متاح لـ SKU هذا",
    },
  },
} as const satisfies Record<string, ErrorDef>;
