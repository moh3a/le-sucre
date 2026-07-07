import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const INIT_ERROR = {
  ALREADY_COMPLETED: {
    code: "INIT_ALREADY_COMPLETED",
    status: 409,
    message: {
      fr: "Le système a déjà été initialisé",
      en: "System has already been initialized",
      ar: "تمت تهيئة النظام بالفعل",
    },
  },
  NOT_COMPLETED: {
    code: "INIT_NOT_COMPLETED",
    status: 400,
    message: {
      fr: "Le système n'a pas encore été initialisé",
      en: "System has not been initialized yet",
      ar: "لم تتم تهيئة النظام بعد",
    },
  },
  MIGRATION_FAILED: {
    code: "INIT_MIGRATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'exécution des migrations",
      en: "Failed to run database migrations",
      ar: "فشل تشغيل ترحيل قاعدة البيانات",
    },
  },
  SEED_FAILED: {
    code: "INIT_SEED_FAILED",
    status: 500,
    message: {
      fr: "Échec du remplissage des données initiales",
      en: "Failed to seed initial data",
      ar: "فشل في تعبئة البيانات الأولية",
    },
  },
  ADMIN_CREATION_FAILED: {
    code: "INIT_ADMIN_CREATION_FAILED",
    status: 500,
    message: {
      fr: "Échec de la création du compte administrateur",
      en: "Failed to create administrator account",
      ar: "فشل إنشاء حساب المسؤول",
    },
  },
  COMPLETION_FAILED: {
    code: "INIT_COMPLETION_FAILED",
    status: 500,
    message: {
      fr: "Échec de la finalisation de l'initialisation",
      en: "Failed to complete initialization",
      ar: "فشل إكمال التهيئة",
    },
  },
} as const satisfies Record<string, ErrorDef>;
