import type { ErrorDef } from "../../shared/error-codes";

export const WAREHOUSE_ERROR = {
  NOT_FOUND: {
    code: "WAREHOUSE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Entrepôt introuvable",
      en: "Warehouse not found",
      ar: "المستودع غير موجود",
    },
  },
  SLUG_CONFLICT: {
    code: "WAREHOUSE_SLUG_CONFLICT",
    status: 409,
    message: {
      fr: "Un entrepôt avec ce slug existe déjà",
      en: "A warehouse with this slug already exists",
      ar: "يوجد مستودع بهذا المعرف بالفعل",
    },
  },
  INVALID_SLUG: {
    code: "WAREHOUSE_INVALID_SLUG",
    status: 400,
    message: {
      fr: "Le slug doit contenir uniquement des lettres minuscules, chiffres, tirets et underscores",
      en: "Slug must contain only lowercase letters, numbers, hyphens and underscores",
      ar: "يجب أن يحتوي المعرف على أحرف صغيرة وأرقام وشرطات وشرطات سفلية فقط",
    },
  },
} as const satisfies Record<string, ErrorDef>;
