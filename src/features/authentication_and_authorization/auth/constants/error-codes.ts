import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const AUTH_ERROR = {
  SESSION_REQUIRED: {
    code: "AUTH_SESSION_REQUIRED",
    status: 401,
    message: {
      fr: "Authentification requise",
      en: "Authentication required",
      ar: "المصادقة مطلوبة",
    },
  },
  SESSION_EXPIRED: {
    code: "AUTH_SESSION_EXPIRED",
    status: 401,
    message: {
      fr: "Session expirée",
      en: "Session has expired",
      ar: "انتهت الجلسة",
    },
  },
  INVALID_CREDENTIALS: {
    code: "AUTH_INVALID_CREDENTIALS",
    status: 401,
    message: {
      fr: "Email ou mot de passe invalide",
      en: "Invalid email or password",
      ar: "البريد الإلكتروني أو كلمة المرور غير صالحة",
    },
  },
  ACCOUNT_LOCKED: {
    code: "AUTH_ACCOUNT_LOCKED",
    status: 423,
    message: {
      fr: "Compte verrouillé après trop de tentatives",
      en: "Account locked after too many attempts",
      ar: "تم قفل الحساب بعد محاولات كثيرة",
    },
  },
  EMAIL_NOT_VERIFIED: {
    code: "AUTH_EMAIL_NOT_VERIFIED",
    status: 403,
    message: {
      fr: "Email non vérifié",
      en: "Email not verified",
      ar: "البريد الإلكتروني غير موثق",
    },
  },
  USER_NOT_FOUND: {
    code: "AUTH_USER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Utilisateur introuvable",
      en: "User not found",
      ar: "المستخدم غير موجود",
    },
  },
  LOGIN_FAILED: {
    code: "AUTH_LOGIN_FAILED",
    status: 401,
    message: {
      fr: "Échec de connexion",
      en: "Login failed",
      ar: "فشل تسجيل الدخول",
    },
  },
} as const satisfies Record<string, ErrorDef>;
