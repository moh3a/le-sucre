import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const PROFILE_ERROR = {
  NOT_FOUND: {
    code: "PROFILE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Profil introuvable",
      en: "Profile not found",
      ar: "الملف الشخصي غير موجود",
    },
  },
  NOT_INITIALIZED: {
    code: "PROFILE_NOT_INITIALIZED",
    status: 404,
    message: {
      fr: "Profil non initialisé. Veuillez compléter votre profil.",
      en: "Profile not initialized. Please complete your profile.",
      ar: "الملف الشخصي غير مهيأ. يرجى إكمال ملفك الشخصي.",
    },
  },
  ADDRESS_NOT_FOUND: {
    code: "ADDRESS_NOT_FOUND",
    status: 404,
    message: {
      fr: "Adresse introuvable",
      en: "Address not found",
      ar: "العنوان غير موجود",
    },
  },
  ADDRESS_LIMIT_REACHED: {
    code: "ADDRESS_LIMIT_REACHED",
    status: 400,
    message: {
      fr: "Nombre maximum d'adresses atteint (10)",
      en: "Maximum number of addresses reached (10)",
      ar: "تم الوصول إلى الحد الأقصى لعدد العناوين (10)",
    },
  },
  PHONE_ALREADY_EXISTS: {
    code: "PHONE_ALREADY_EXISTS",
    status: 409,
    message: {
      fr: "Ce numéro de téléphone est déjà utilisé",
      en: "This phone number is already in use",
      ar: "رقم الهاتف هذا مستخدم بالفعل",
    },
  },
} as const satisfies Record<string, ErrorDef>;
