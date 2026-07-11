import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const VARIANT_ERROR = {
  NOT_FOUND: {
    code: "VARIANT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Propriété introuvable",
      en: "Property not found",
      ar: "الخاصية غير موجودة",
    },
  },
  VALUE_NOT_FOUND: {
    code: "VARIANT_VALUE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Valeur de propriété introuvable",
      en: "Property value not found",
      ar: "قيمة الخاصية غير موجودة",
    },
  },
  SLUG_CONFLICT: {
    code: "VARIANT_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une propriété avec ce slug existe déjà",
      en: "A property with this slug already exists",
      ar: "توجد خاصية بهذا المعرف بالفعل",
    },
  },
  VALUE_SLUG_CONFLICT: {
    code: "VARIANT_VALUE_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une valeur de propriété avec ce slug existe déjà",
      en: "A property value with this slug already exists",
      ar: "توجد قيمة خاصية بهذا المعرف بالفعل",
    },
  },
  PRODUCT_NOT_FOUND: {
    code: "VARIANT_PRODUCT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit introuvable pour la configuration de variantes",
      en: "Product not found for variant configuration",
      ar: "المنتج غير موجود لتكوين المتغيرات",
    },
  },
  ALREADY_ENABLED: {
    code: "VARIANT_ALREADY_ENABLED",
    status: 409,
    message: {
      fr: "Le mode variantes est déjà activé pour ce produit",
      en: "Variant mode is already enabled for this product",
      ar: "وضع المتغيرات مفعل بالفعل لهذا المنتج",
    },
  },
  PROPERTY_HAS_SKUS: {
    code: "VARIANT_PROPERTY_HAS_SKUS",
    status: 409,
    message: {
      fr: "La propriété est utilisée par des SKUs et ne peut pas être supprimée",
      en: "Property is used by existing SKUs and cannot be deleted",
      ar: "الخاصية مستخدمة بواسطة SKUs ولا يمكن حذفها",
    },
  },
  VALUE_IN_USE: {
    code: "VARIANT_VALUE_IN_USE",
    status: 409,
    message: {
      fr: "La valeur est utilisée par des SKUs et ne peut pas être supprimée",
      en: "Value is used by existing SKUs and cannot be deleted",
      ar: "القيمة مستخدمة بواسطة SKUs ولا يمكن حذفها",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const SKU_ERROR = {
  NOT_FOUND: {
    code: "SKU_NOT_FOUND",
    status: 404,
    message: {
      fr: "SKU introuvable",
      en: "SKU not found",
      ar: "SKU غير موجود",
    },
  },
  CODE_CONFLICT: {
    code: "SKU_CODE_CONFLICT",
    status: 409,
    message: {
      fr: "Un SKU avec ce code existe déjà",
      en: "A SKU with this code already exists",
      ar: "يوجد SKU بهذا الرمز بالفعل",
    },
  },
  INVALID_PRICE: {
    code: "SKU_INVALID_PRICE",
    status: 400,
    message: {
      fr: "Prix SKU invalide",
      en: "Invalid SKU price",
      ar: "سعر SKU غير صالح",
    },
  },
  PRICE_TIER_NOT_FOUND: {
    code: "SKU_PRICE_TIER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Palier de prix introuvable",
      en: "Price tier not found",
      ar: "مستوى السعر غير موجود",
    },
  },
  PRICE_TIER_CONFLICT: {
    code: "SKU_PRICE_TIER_CONFLICT",
    status: 409,
    message: {
      fr: "Palier de prix existe déjà pour ce groupe de clients",
      en: "Price tier already exists for this customer group",
      ar: "مستوى السعر موجود بالفعل لهذه المجموعة",
    },
  },
  WHOLESALE_RULE_NOT_FOUND: {
    code: "SKU_WHOLESALE_RULE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Règle de gros introuvable",
      en: "Wholesale rule not found",
      ar: "قاعدة الجملة غير موجودة",
    },
  },
  WHOLESALE_RULE_CONFLICT: {
    code: "SKU_WHOLESALE_RULE_CONFLICT",
    status: 409,
    message: {
      fr: "La règle de gros entre en conflit avec une règle existante",
      en: "Wholesale rule conflicts with existing rule",
      ar: "تتعارض قاعدة الجملة مع قاعدة موجودة",
    },
  },
  PRODUCT_HAS_NO_VARIANTS: {
    code: "SKU_PRODUCT_HAS_NO_VARIANTS",
    status: 400,
    message: {
      fr: "Le produit n'a pas le mode variantes activé",
      en: "Product does not have variant mode enabled",
      ar: "المنتج ليس لديه وضع المتغيرات مفعلًا",
    },
  },
  GENERATION_FAILED: {
    code: "SKU_GENERATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de la génération des SKUs",
      en: "SKU generation failed",
      ar: "فشل توليد SKUs",
    },
  },
  BULK_DELETE_FAILED: {
    code: "SKU_BULK_DELETE_FAILED",
    status: 500,
    message: {
      fr: "Échec de la suppression groupée des SKUs",
      en: "Bulk SKU deletion failed",
      ar: "فشل الحذف الجماعي لـ SKUs",
    },
  },
  BULK_UPDATE_FAILED: {
    code: "SKU_BULK_UPDATE_FAILED",
    status: 500,
    message: {
      fr: "Échec de la mise à jour groupée des SKUs",
      en: "Bulk SKU update failed",
      ar: "فشل التحديث الجماعي لـ SKUs",
    },
  },
  HAS_ASSOCIATED_ORDERS: {
    code: "SKU_HAS_ASSOCIATED_ORDERS",
    status: 409,
    message: {
      fr: "Ce SKU est associé à des commandes et ne peut pas être supprimé",
      en: "This SKU is associated with existing orders and cannot be deleted",
      ar: "هذا الـ SKU مرتبط بطلبات موجودة ولا يمكن حذفه",
    },
  },
  INVALID_WHOLESALE_SCOPE: {
    code: "SKU_INVALID_WHOLESALE_SCOPE",
    status: 400,
    message: {
      fr: "Veuillez fournir exactement un product_id ou un sku_id",
      en: "Provide exactly one of product_id or sku_id",
      ar: "يجب تحديد أحد المعرّفين product_id أو sku_id فقط",
    },
  },
  DATABASE_OPERATION_FAILED: {
    code: "SKU_DATABASE_OPERATION_FAILED",
    status: 500,
    message: {
      fr: "L'opération a échoué car les données ont été modifiées par un autre processus. Veuillez réessayer",
      en: "The operation failed because the data was modified by another process. Please try again",
      ar: "فشلت العملية لأن البيانات تم تعديلها بواسطة عملية أخرى. يرجى المحاولة مرة أخرى",
    },
  },
} as const satisfies Record<string, ErrorDef>;
