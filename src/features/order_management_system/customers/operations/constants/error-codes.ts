import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const CUSTOMER_RELATIONS_ERROR = {
  FOLLOW_UP_NOT_FOUND: { code: "FOLLOW_UP_NOT_FOUND", status: 404, message: { fr: "Relance introuvable", en: "Follow-up not found", ar: "لم يتم العثور على المتابعة" } },
  CASE_NOT_FOUND: { code: "CASE_NOT_FOUND", status: 404, message: { fr: "Cas de support introuvable", en: "Support case not found", ar: "لم يتم العثور على حالة الدعم" } },
  INVALID_STATUS: { code: "INVALID_STATUS", status: 409, message: { fr: "Statut invalide pour cette opération", en: "Invalid status for this operation", ar: "حالة غير صالحة لهذه العملية" } },
} as const satisfies Record<string, ErrorDef>;
