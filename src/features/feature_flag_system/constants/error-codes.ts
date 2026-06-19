import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const FEATURE_FLAG_ERROR = {
  NOT_FOUND: {
    code: "FEATURE_FLAG_NOT_FOUND",
    status: 404,
    message: {
      fr: "Feature flag introuvable",
      en: "Feature flag not found",
      ar: "علامة الميزة غير موجودة",
    },
  },
  KEY_CONFLICT: {
    code: "FEATURE_FLAG_KEY_CONFLICT",
    status: 409,
    message: {
      fr: "Une feature flag avec cette clé existe déjà",
      en: "A feature flag with this key already exists",
      ar: "توجد علامة ميزة بهذا المفتاح بالفعل",
    },
  },
  INVALID_KEY: {
    code: "FEATURE_FLAG_INVALID_KEY",
    status: 400,
    message: {
      fr: "Clé de feature flag invalide. Utilisez uniquement des lettres, chiffres, tirets et underscores",
      en: "Invalid feature flag key. Use only letters, numbers, hyphens and underscores",
      ar: "مفتاح علامة الميزة غير صالح. استخدم فقط الأحرف والأرقام والواصلات والشرطات السفلية",
    },
  },
} as const satisfies Record<string, ErrorDef>;
