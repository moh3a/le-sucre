import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const BRAND_ERROR = {
  NOT_FOUND: {
    code: "BRAND_NOT_FOUND",
    status: 404,
    message: {
      fr: "Marque introuvable",
      en: "Brand not found",
      ar: "العلامة التجارية غير موجودة",
    },
  },
  SLUG_CONFLICT: {
    code: "BRAND_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une marque avec ce slug existe déjà",
      en: "A brand with this slug already exists",
      ar: "توجد علامة تجارية بهذا المعرف بالفعل",
    },
  },
  HAS_PRODUCTS: {
    code: "BRAND_HAS_PRODUCTS",
    status: 409,
    message: {
      fr: "Impossible de supprimer la marque avec des produits associés",
      en: "Cannot delete brand with associated products",
      ar: "لا يمكن حذف العلامة التجارية مع المنتجات المرتبطة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
