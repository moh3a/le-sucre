import type { ErrorDef } from "../../shared/error-codes";

export const FORECAST_ERROR = {
  SKU_NOT_FOUND: {
    code: "FORECAST_SKU_NOT_FOUND",
    status: 404,
    message: {
      fr: "SKU introuvable pour les prévisions",
      en: "SKU not found for forecasting",
      ar: "SKU غير موجود للتنبؤ",
    },
  },
  PROVIDER_UNAVAILABLE: {
    code: "FORECAST_PROVIDER_UNAVAILABLE",
    status: 503,
    message: {
      fr: "Le fournisseur de prévisions est indisponible",
      en: "Forecast provider is unavailable",
      ar: "موفر التنبؤ غير متاح",
    },
  },
  JOB_NOT_FOUND: {
    code: "FORECAST_JOB_NOT_FOUND",
    status: 404,
    message: {
      fr: "Tâche de prévision introuvable",
      en: "Forecast job not found",
      ar: "مهمة التنبؤ غير موجودة",
    },
  },
  RULE_NOT_FOUND: {
    code: "FORECAST_RULE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Règle d'alerte introuvable",
      en: "Alert rule not found",
      ar: "قاعدة التنبيه غير موجودة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
