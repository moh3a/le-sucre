import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const RECOMMENDATION_ERROR = {
  PRODUCT_NOT_FOUND: {
    code: "RECOMMENDATION_PRODUCT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit de base introuvable pour les recommandations",
      en: "Base product not found for recommendations",
      ar: "المنتج الأساسي غير موجود للتوصيات",
    },
  },
  INVALID_TYPE: {
    code: "RECOMMENDATION_INVALID_TYPE",
    status: 400,
    message: {
      fr: "Type de recommandation invalide",
      en: "Invalid recommendation type",
      ar: "نوع التوصية غير صالح",
    },
  },
  LIMIT_EXCEEDED: {
    code: "RECOMMENDATION_LIMIT_EXCEEDED",
    status: 400,
    message: {
      fr: "La limite de recommandations dépasse le maximum autorisé",
      en: "Recommendation limit exceeds maximum allowed",
      ar: "حد التوصيات يتجاوز الحد الأقصى المسموح به",
    },
  },
  NO_DATA: {
    code: "RECOMMENDATION_NO_DATA",
    status: 404,
    message: {
      fr: "Aucune donnée de recommandation disponible",
      en: "No recommendation data available",
      ar: "لا توجد بيانات توصية متاحة",
    },
  },
  CACHE_SET_FAILED: {
    code: "RECOMMENDATION_CACHE_SET_FAILED",
    status: 500,
    message: {
      fr: "Échec de la mise en cache des recommandations",
      en: "Failed to cache recommendations",
      ar: "فشل تخزين التوصيات مؤقتاً",
    },
  },
  CACHE_INVALIDATION_FAILED: {
    code: "RECOMMENDATION_CACHE_INVALIDATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'invalidation du cache de recommandations",
      en: "Failed to invalidate recommendation cache",
      ar: "فشل إبطال ذاكرة التخزين المؤقت للتوصيات",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const VIEW_TRACKING_ERROR = {
  PRODUCT_NOT_FOUND: {
    code: "VIEW_TRACKING_PRODUCT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit introuvable pour le suivi des vues",
      en: "Product not found for view tracking",
      ar: "المنتج غير موجود لتتبع المشاهدات",
    },
  },
  REDIS_FAILED: {
    code: "VIEW_TRACKING_REDIS_FAILED",
    status: 500,
    message: {
      fr: "Erreur de cache de suivi des vues",
      en: "View tracking cache error",
      ar: "خطأ في ذاكرة التخزين المؤقت لتتبع المشاهدات",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const TRENDING_INDEX_ERROR = {
  PERSIST_FAILED: {
    code: "TRENDING_INDEX_PERSIST_FAILED",
    status: 500,
    message: {
      fr: "Échec de la persistance des scores tendances",
      en: "Failed to persist trending scores",
      ar: "فشل حفظ درجات الترند",
    },
  },
  INVALID_PERIOD: {
    code: "TRENDING_INDEX_INVALID_PERIOD",
    status: 400,
    message: {
      fr: "Période de tendance invalide",
      en: "Invalid trending period",
      ar: "فترة الترند غير صالحة",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const RECOMMENDATION_INDEX_ERROR = {
  ENQUEUE_FAILED: {
    code: "RECOMMENDATION_INDEX_ENQUEUE_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'ajout à la file d'indexation",
      en: "Failed to enqueue index job",
      ar: "فشل إضافة مهمة الفهرسة إلى قائمة الانتظار",
    },
  },
  JOB_NOT_FOUND: {
    code: "RECOMMENDATION_INDEX_JOB_NOT_FOUND",
    status: 404,
    message: {
      fr: "Tâche d'indexation introuvable",
      en: "Index job not found",
      ar: "مهمة الفهرسة غير موجودة",
    },
  },
  REINDEX_FAILED: {
    code: "RECOMMENDATION_INDEX_REINDEX_FAILED",
    status: 500,
    message: {
      fr: "Échec de la réindexation du produit",
      en: "Product reindexing failed",
      ar: "فشل إعادة فهرسة المنتج",
    },
  },
} as const satisfies Record<string, ErrorDef>;
