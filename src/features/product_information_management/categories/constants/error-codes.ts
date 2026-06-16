import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const CATEGORY_ERROR = {
  NOT_FOUND: {
    code: "CATEGORY_NOT_FOUND",
    status: 404,
    message: {
      fr: "Catégorie introuvable",
      en: "Category not found",
      ar: "الفئة غير موجودة",
    },
  },
  SLUG_CONFLICT: {
    code: "CATEGORY_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une catégorie avec ce slug existe déjà",
      en: "A category with this slug already exists",
      ar: "توجد فئة بهذا المعرف بالفعل",
    },
  },
  HAS_CHILDREN: {
    code: "CATEGORY_HAS_CHILDREN",
    status: 409,
    message: {
      fr: "Supprimez ou déplacez les sous-catégories d'abord",
      en: "Delete or move sub-categories first",
      ar: "قم بحذف أو نقل الفئات الفرعية أولاً",
    },
  },
  INVALID_PARENT: {
    code: "CATEGORY_INVALID_PARENT",
    status: 400,
    message: {
      fr: "Impossible de déplacer une catégorie vers son propre descendant",
      en: "Cannot move category to its own descendant",
      ar: "لا يمكن نقل الفئة إلى فرعها الخاص",
    },
  },
  CIRCULAR_REFERENCE: {
    code: "CATEGORY_CIRCULAR_REFERENCE",
    status: 400,
    message: {
      fr: "Référence circulaire détectée",
      en: "Circular reference detected",
      ar: "تم اكتشاف مرجع دائري",
    },
  },
  DEPTH_EXCEEDED: {
    code: "CATEGORY_DEPTH_EXCEEDED",
    status: 400,
    message: {
      fr: "Profondeur maximale de catégorie dépassée",
      en: "Maximum category depth exceeded",
      ar: "تم تجاوز الحد الأقصى لعمق الفئة",
    },
  },
  CACHE_SET_FAILED: {
    code: "CATEGORY_CACHE_SET_FAILED",
    status: 500,
    message: {
      fr: "Échec de la mise en cache des catégories",
      en: "Failed to cache category data",
      ar: "فشل تخزين بيانات الفئة مؤقتاً",
    },
  },
  CACHE_GET_FAILED: {
    code: "CATEGORY_CACHE_GET_FAILED",
    status: 500,
    message: {
      fr: "Échec de la lecture du cache des catégories",
      en: "Failed to read category cache",
      ar: "فشل قراءة ذاكرة التخزين المؤقت للفئة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
