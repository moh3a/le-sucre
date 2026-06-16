import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const ANALYTICS_EVENT_ERROR = {
  INVALID_TYPE: {
    code: "ANALYTICS_EVENT_INVALID_TYPE",
    status: 400,
    message: {
      fr: "Type d'événement analytique invalide",
      en: "Invalid analytics event type",
      ar: "نوع حدث التحليلات غير صالح",
    },
  },
  INVALID_PAYLOAD: {
    code: "ANALYTICS_EVENT_INVALID_PAYLOAD",
    status: 400,
    message: {
      fr: "Charge utile d'événement invalide",
      en: "Invalid event payload",
      ar: "حمولة الحدث غير صالحة",
    },
  },
  INGESTION_FAILED: {
    code: "ANALYTICS_EVENT_INGESTION_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'ingestion de l'événement analytique",
      en: "Failed to ingest analytics event",
      ar: "فشل استيعاب حدث التحليلات",
    },
  },
  BATCH_FAILED: {
    code: "ANALYTICS_EVENT_BATCH_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'ingestion par lots",
      en: "Batch event ingestion failed",
      ar: "فشل استيعاب الأحداث المجمعة",
    },
  },
  REDIS_FAILED: {
    code: "ANALYTICS_EVENT_REDIS_FAILED",
    status: 500,
    message: {
      fr: "File d'attente Redis indisponible",
      en: "Redis event queue unavailable",
      ar: "قائمة انتظار Redis غير متاحة",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const ANALYTICS_QUERY_ERROR = {
  OVERVIEW_FAILED: {
    code: "ANALYTICS_QUERY_OVERVIEW_FAILED",
    status: 500,
    message: {
      fr: "Échec du calcul de l'aperçu analytique",
      en: "Failed to compute analytics overview",
      ar: "فشل حساب نظرة عامة التحليلات",
    },
  },
  PRODUCT_FAILED: {
    code: "ANALYTICS_QUERY_PRODUCT_FAILED",
    status: 500,
    message: {
      fr: "Échec du calcul des analytiques produit",
      en: "Failed to compute product analytics",
      ar: "فشل حساب تحليلات المنتج",
    },
  },
  SEARCH_FAILED: {
    code: "ANALYTICS_QUERY_SEARCH_FAILED",
    status: 500,
    message: {
      fr: "Échec du calcul des analytiques de recherche",
      en: "Failed to compute search analytics",
      ar: "فشل حساب تحليلات البحث",
    },
  },
  REALTIME_FAILED: {
    code: "ANALYTICS_QUERY_REALTIME_FAILED",
    status: 500,
    message: {
      fr: "Échec de la récupération des analytiques en temps réel",
      en: "Failed to fetch realtime analytics",
      ar: "فشل جلب التحليلات في الوقت الفعلي",
    },
  },
  DATE_RANGE_INVALID: {
    code: "ANALYTICS_QUERY_DATE_RANGE_INVALID",
    status: 400,
    message: {
      fr: "Plage de dates invalide pour la requête analytique",
      en: "Invalid date range for analytics query",
      ar: "نطاق تاريخ غير صالح لاستعلام التحليلات",
    },
  },
  PRODUCT_NOT_FOUND: {
    code: "ANALYTICS_QUERY_PRODUCT_NOT_FOUND",
    status: 404,
    message: {
      fr: "Produit introuvable pour les analytiques",
      en: "Product not found for analytics",
      ar: "المنتج غير موجود للتحليلات",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const ANALYTICS_CACHE_ERROR = {
  GET_FAILED: {
    code: "ANALYTICS_CACHE_GET_FAILED",
    status: 500,
    message: {
      fr: "Échec de la lecture du cache analytique",
      en: "Failed to read analytics cache",
      ar: "فشل قراءة ذاكرة التخزين المؤقت للتحليلات",
    },
  },
  SET_FAILED: {
    code: "ANALYTICS_CACHE_SET_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'écriture du cache analytique",
      en: "Failed to write analytics cache",
      ar: "فشل كتابة ذاكرة التخزين المؤقت للتحليلات",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const ANALYTICS_AGGREGATION_ERROR = {
  ROLLUP_FAILED: {
    code: "ANALYTICS_AGGREGATION_ROLLUP_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'agrégation quotidienne des données",
      en: "Daily data rollup failed",
      ar: "فشل تجميع البيانات اليومية",
    },
  },
  PRODUCT_ROLLUP_FAILED: {
    code: "ANALYTICS_AGGREGATION_PRODUCT_ROLLUP_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'agrégation quotidienne des produits",
      en: "Product daily rollup failed",
      ar: "فشل التجميع اليومي للمنتج",
    },
  },
  FUNNEL_ROLLUP_FAILED: {
    code: "ANALYTICS_AGGREGATION_FUNNEL_ROLLUP_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'agrégation quotidienne de l'entonnoir",
      en: "Funnel daily rollup failed",
      ar: "فشل التجميع اليومي للقمع",
    },
  },
  SEARCH_ROLLUP_FAILED: {
    code: "ANALYTICS_AGGREGATION_SEARCH_ROLLUP_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'agrégation quotidienne des recherches",
      en: "Search daily rollup failed",
      ar: "فشل التجميع اليومي للبحث",
    },
  },
  INVALID_DATE: {
    code: "ANALYTICS_AGGREGATION_INVALID_DATE",
    status: 400,
    message: {
      fr: "Date invalide pour l'agrégation",
      en: "Invalid date for aggregation rollup",
      ar: "تاريخ غير صالح للتجميع",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const ANALYTICS_RETENTION_ERROR = {
  PURGE_FAILED: {
    code: "ANALYTICS_RETENTION_PURGE_FAILED",
    status: 500,
    message: {
      fr: "Échec de la purge des données analytiques anciennes",
      en: "Failed to purge old analytics data",
      ar: "فشل تنظيف بيانات التحليلات القديمة",
    },
  },
} as const satisfies Record<string, ErrorDef>;

export const ANALYTICS_JOB_ERROR = {
  RUNNER_FAILED: {
    code: "ANALYTICS_JOB_RUNNER_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'exécution du planificateur analytique",
      en: "Analytics job runner execution failed",
      ar: "فشل تنفيذ مشغل مهام التحليلات",
    },
  },
} as const satisfies Record<string, ErrorDef>;
