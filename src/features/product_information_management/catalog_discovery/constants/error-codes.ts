import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const SEARCH_ERROR = {
  QUERY_TOO_SHORT: {
    code: "SEARCH_QUERY_TOO_SHORT",
    status: 400,
    message: {
      fr: "La recherche doit contenir au moins 2 caractères",
      en: "Search query must be at least 2 characters",
      ar: "يجب أن يحتوي البحث على حرفين على الأقل",
    },
  },
  QUERY_TOO_LONG: {
    code: "SEARCH_QUERY_TOO_LONG",
    status: 400,
    message: {
      fr: "La recherche dépasse la longueur maximale",
      en: "Search query exceeds maximum length",
      ar: "يتجاوز البحث الحد الأقصى للطول",
    },
  },
  FACET_NOT_FOUND: {
    code: "SEARCH_FACET_NOT_FOUND",
    status: 404,
    message: {
      fr: "Facette introuvable",
      en: "Facet not found",
      ar: "الجانب غير موجود",
    },
  },
  INVALID_FILTER: {
    code: "SEARCH_INVALID_FILTER",
    status: 400,
    message: {
      fr: "Filtre de recherche invalide",
      en: "Invalid search filter",
      ar: "عامل تصفية البحث غير صالح",
    },
  },
  CACHE_MISS: {
    code: "SEARCH_CACHE_MISS",
    status: 500,
    message: {
      fr: "Cache de recherche indisponible",
      en: "Search cache unavailable",
      ar: "ذاكرة التخزين المؤقت للبحث غير متاحة",
    },
  },
  CACHE_SET_FAILED: {
    code: "SEARCH_CACHE_SET_FAILED",
    status: 500,
    message: {
      fr: "Échec de la mise en cache des résultats",
      en: "Failed to cache search results",
      ar: "فشل تخزين نتائج البحث مؤقتاً",
    },
  },
  CACHE_INVALIDATION_FAILED: {
    code: "SEARCH_CACHE_INVALIDATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'invalidation du cache de recherche",
      en: "Failed to invalidate search cache",
      ar: "فشل إبطال ذاكرة التخزين المؤقت للبحث",
    },
  },
} as const satisfies Record<string, ErrorDef>;
