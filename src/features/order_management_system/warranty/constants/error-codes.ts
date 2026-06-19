import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const WARRANTY_ERROR = {
  WARRANTY_NOT_FOUND: { code: "WARRANTY_NOT_FOUND", status: 404, message: { fr: "Demande de garantie introuvable", en: "Warranty request not found", ar: "لم يتم العثور على طلب الضمان" } },
} as const satisfies Record<string, ErrorDef>;
