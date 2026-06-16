import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const AUTHORIZATION_ERROR = {
  FORBIDDEN: {
    code: "AUTH_FORBIDDEN",
    status: 403,
    message: {
      fr: "Vous n'avez pas la permission d'effectuer cette action",
      en: "You do not have permission to perform this action",
      ar: "ليس لديك الإذن للقيام بهذا الإجراء",
    },
  },
  STAFF_REQUIRED: {
    code: "AUTH_STAFF_REQUIRED",
    status: 403,
    message: {
      fr: "Accès personnel requis",
      en: "Staff access required",
      ar: "مطلوب وصول الموظفين",
    },
  },
  CONSOLE_ACCESS_REQUIRED: {
    code: "AUTH_CONSOLE_ACCESS_REQUIRED",
    status: 403,
    message: {
      fr: "Accès à la console requis",
      en: "Console access required",
      ar: "مطلوب الوصول إلى لوحة التحكم",
    },
  },
  PERMISSION_MISSING: {
    code: "AUTH_PERMISSION_MISSING",
    status: 403,
    message: {
      fr: "Permission requise",
      en: "Required permission",
      ar: "الإذن المطلوب",
    },
  },
  CUSTOMER_REQUIRED: {
    code: "AUTH_CUSTOMER_REQUIRED",
    status: 403,
    message: {
      fr: "Compte client requis",
      en: "Customer account required",
      ar: "حساب العميل مطلوب",
    },
  },
  ROLE_NOT_FOUND: {
    code: "AUTH_ROLE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Rôle introuvable",
      en: "Role not found",
      ar: "الدور غير موجود",
    },
  },
  ROLE_ALREADY_ASSIGNED: {
    code: "AUTH_ROLE_ALREADY_ASSIGNED",
    status: 409,
    message: {
      fr: "Rôle déjà attribué à l'utilisateur",
      en: "Role already assigned to user",
      ar: "الدور مُخصص بالفعل للمستخدم",
    },
  },
  AUDIT_LOG_FAILED: {
    code: "AUTH_AUDIT_LOG_FAILED",
    status: 500,
    message: {
      fr: "Échec de l'enregistrement du journal d'audit",
      en: "Failed to record audit log",
      ar: "فشل تسجيل سجل التدقيق",
    },
  },
} as const satisfies Record<string, ErrorDef>;
