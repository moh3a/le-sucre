import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const PRODUCT_ERROR = {
  NOT_FOUND: {
    code: "PRODUCT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit introuvable",
      en: "Product not found",
      ar: "المنتج غير موجود",
    },
  },
  SLUG_CONFLICT: {
    code: "PRODUCT_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Un produit avec ce slug existe déjà",
      en: "A product with this slug already exists",
      ar: "يوجد منتج بهذا المعرف بالفعل",
    },
  },
  CATEGORY_NOT_FOUND: {
    code: "PRODUCT_CATEGORY_NOT_FOUND",
    status: 404,
    message: {
      fr: "Catégorie introuvable",
      en: "Category not found",
      ar: "الفئة غير موجودة",
    },
  },
  BRAND_NOT_FOUND: {
    code: "PRODUCT_BRAND_NOT_FOUND",
    status: 404,
    message: {
      fr: "Marque introuvable",
      en: "Brand not found",
      ar: "العلامة التجارية غير موجودة",
    },
  },
  INVALID_STATUS: {
    code: "PRODUCT_INVALID_STATUS",
    status: 400,
    message: {
      fr: "Statut du produit invalide",
      en: "Invalid product status",
      ar: "حالة المنتج غير صالحة",
    },
  },
  INVALID_PRICE: {
    code: "PRODUCT_INVALID_PRICE",
    status: 400,
    message: {
      fr: "Prix du produit invalide",
      en: "Invalid product price",
      ar: "سعر المنتج غير صالح",
    },
  },
  TRANSLATION_NOT_FOUND: {
    code: "PRODUCT_TRANSLATION_NOT_FOUND",
    status: 404,
    message: {
      fr: "Traduction introuvable pour cette langue",
      en: "Translation not found for this locale",
      ar: "الترجمة غير موجودة لهذه اللغة",
    },
  },
  MEDIA_NOT_FOUND: {
    code: "PRODUCT_MEDIA_NOT_FOUND",
    status: 404,
    message: {
      fr: "Média introuvable",
      en: "Media not found",
      ar: "الوسائط غير موجودة",
    },
  },
  MEDIA_LIMIT_EXCEEDED: {
    code: "PRODUCT_MEDIA_LIMIT_EXCEEDED",
    status: 400,
    message: {
      fr: "Limite maximale de médias dépassée pour ce produit",
      en: "Maximum media limit exceeded for this product",
      ar: "تم تجاوز الحد الأقصى للوسائط لهذا المنتج",
    },
  },
  MEDIA_UPLOAD_FAILED: {
    code: "PRODUCT_MEDIA_UPLOAD_FAILED",
    status: 500,
    message: {
      fr: "Échec du téléchargement du fichier",
      en: "File upload failed",
      ar: "فشل رفع الملف",
    },
  },
  MEDIA_INVALID_TYPE: {
    code: "PRODUCT_MEDIA_INVALID_TYPE",
    status: 400,
    message: {
      fr: "Type de média invalide",
      en: "Invalid media type",
      ar: "نوع الوسائط غير صالح",
    },
  },
  MEDIA_FILE_TOO_LARGE: {
    code: "PRODUCT_MEDIA_FILE_TOO_LARGE",
    status: 400,
    message: {
      fr: "Fichier dépasse la taille maximale",
      en: "File exceeds maximum size",
      ar: "الملف يتجاوز الحجم الأقصى",
    },
  },
  MEDIA_NOT_ATTACHED: {
    code: "PRODUCT_MEDIA_NOT_ATTACHED",
    status: 404,
    message: {
      fr: "Média non attaché au produit",
      en: "Media not attached to product",
      ar: "الوسائط غير مرتبطة بالمنتج",
    },
  },
  BULK_EMPTY: {
    code: "PRODUCT_ADMIN_BULK_EMPTY",
    status: 400,
    message: {
      fr: "Aucun produit sélectionné pour l'opération groupée",
      en: "No products selected for bulk operation",
      ar: "لم يتم تحديد أي منتجات للعملية الجماعية",
    },
  },
  BULK_INVALID_ACTION: {
    code: "PRODUCT_ADMIN_BULK_INVALID_ACTION",
    status: 400,
    message: {
      fr: "Action groupée invalide",
      en: "Invalid bulk action",
      ar: "إجراء جماعي غير صالح",
    },
  },
  EXPORT_FAILED: {
    code: "PRODUCT_ADMIN_EXPORT_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'exportation des produits",
      en: "Product export failed",
      ar: "فشل تصدير المنتجات",
    },
  },
} as const satisfies Record<string, ErrorDef>;


