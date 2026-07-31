import type { ErrorDef } from "@/features/fulfillment_management_system/shared/error-codes";

export const SETTINGS_ERROR = {
  LOAD_FAILED: {
    code: "SETTINGS_LOAD_FAILED",
    status: 500,
    message: {
      fr: "Erreur lors du chargement des paramètres",
      en: "Failed to load settings",
      ar: "فشل في تحميل الإعدادات",
    },
  },
  UPDATE_FAILED: {
    code: "SETTINGS_UPDATE_FAILED",
    status: 500,
    message: {
      fr: "Erreur lors de la sauvegarde des paramètres",
      en: "Failed to save settings",
      ar: "فشل في حفظ الإعدادات",
    },
  },
  INVALID_ENTRY: {
    code: "SETTINGS_INVALID_ENTRY",
    status: 400,
    message: {
      fr: "Entrée de paramètre invalide",
      en: "Invalid settings entry",
      ar: "إدخال إعدادات غير صالح",
    },
  },
  ENV_STATUS_FAILED: {
    code: "SETTINGS_ENV_STATUS_FAILED",
    status: 500,
    message: {
      fr: "Erreur lors de la vérification de l'état de l'environnement",
      en: "Failed to check environment status",
      ar: "فشل في التحقق من حالة البيئة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
