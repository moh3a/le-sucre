import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const WISHLIST_ERROR = {
  NOT_FOUND: {
    code: "WISHLIST_NOT_FOUND",
    status: 404,
    message: {
      fr: "Liste de souhaits introuvable",
      en: "Wishlist not found",
      ar: "قائمة الرغبات غير موجودة",
    },
  },
  ITEM_NOT_FOUND: {
    code: "WISHLIST_ITEM_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit introuvable dans la liste",
      en: "Product not found in wishlist",
      ar: "المنتج غير موجود في قائمة الرغبات",
    },
  },
  COLLECTION_NOT_FOUND: {
    code: "COLLECTION_NOT_FOUND",
    status: 404,
    message: {
      fr: "Collection introuvable",
      en: "Collection not found",
      ar: "المجموعة غير موجودة",
    },
  },
  SLUG_CONFLICT: {
    code: "WISHLIST_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une liste avec ce nom existe déjà",
      en: "A wishlist with this name already exists",
      ar: "توجد قائمة رغبات بهذا الاسم بالفعل",
    },
  },
  COLLECTION_SLUG_CONFLICT: {
    code: "COLLECTION_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Une collection avec ce nom existe déjà",
      en: "A collection with this name already exists",
      ar: "توجد مجموعة بهذا الاسم بالفعل",
    },
  },
  DUPLICATE_ITEM: {
    code: "WISHLIST_DUPLICATE_ITEM",
    status: 409,
    message: {
      fr: "Ce produit est déjà dans la liste",
      en: "This product is already in the wishlist",
      ar: "هذا المنتج موجود بالفعل في القائمة",
    },
  },
  DUPLICATE_FAVORITE: {
    code: "FAVORITE_DUPLICATE",
    status: 409,
    message: {
      fr: "Cet élément est déjà dans vos favoris",
      en: "This item is already in your favorites",
      ar: "هذا العنصر موجود بالفعل في المفضلة",
    },
  },
  DUPLICATE_SAVED: {
    code: "SAVE_FOR_LATER_DUPLICATE",
    status: 409,
    message: {
      fr: "Ce produit est déjà dans votre liste sauvegardée",
      en: "This product is already saved for later",
      ar: "هذا المنتج محفوظ بالفعل لوقت لاحق",
    },
  },
  SHARE_TOKEN_NOT_FOUND: {
    code: "SHARE_TOKEN_NOT_FOUND",
    status: 404,
    message: {
      fr: "Lien de partage introuvable ou expiré",
      en: "Share link not found or expired",
      ar: "رابط المشاركة غير موجود أو منتهي الصلاحية",
    },
  },
  ACCESS_DENIED: {
    code: "WISHLIST_ACCESS_DENIED",
    status: 403,
    message: {
      fr: "Accès refusé à cette liste de souhaits",
      en: "Access denied to this wishlist",
      ar: "تم رفض الوصول إلى قائمة الرغبات هذه",
    },
  },
  DEFAULT_EXISTS: {
    code: "WISHLIST_DEFAULT_EXISTS",
    status: 409,
    message: {
      fr: "Vous avez déjà une liste de souhaits par défaut",
      en: "You already have a default wishlist",
      ar: "لديك بالفعل قائمة رغبات افتراضية",
    },
  },
  MAX_WISHLISTS: {
    code: "MAX_WISHLISTS_REACHED",
    status: 400,
    message: {
      fr: "Nombre maximum de listes de souhaits atteint (50)",
      en: "Maximum number of wishlists reached (50)",
      ar: "تم الوصول إلى الحد الأقصى لعدد قوائم الرغبات (50)",
    },
  },
  MAX_COLLECTIONS: {
    code: "MAX_COLLECTIONS_REACHED",
    status: 400,
    message: {
      fr: "Nombre maximum de collections atteint (50)",
      en: "Maximum number of collections reached (50)",
      ar: "تم الوصول إلى الحد الأقصى لعدد المجموعات (50)",
    },
  },
  INVALID_PRIORITY: {
    code: "INVALID_PRIORITY",
    status: 400,
    message: {
      fr: "Priorité invalide. Utilisez: low, medium, high, urgent",
      en: "Invalid priority. Use: low, medium, high, urgent",
      ar: "أولوية غير صالحة. استخدم: منخفضة، متوسطة، عالية، عاجلة",
    },
  },
  CART_ITEM_NOT_FOUND: {
    code: "CART_ITEM_NOT_FOUND",
    status: 404,
    message: {
      fr: "Article du panier introuvable",
      en: "Cart item not found",
      ar: "عنصر السلة غير موجود",
    },
  },
} as const satisfies Record<string, ErrorDef>;
