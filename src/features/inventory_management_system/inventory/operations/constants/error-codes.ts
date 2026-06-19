import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const INVENTORY_ADJUSTMENT_ERROR = {
  NOT_FOUND: { code: "INVENTORY_ADJUSTMENT_NOT_FOUND", status: 404, message: { fr: "Demande d'ajustement introuvable", en: "Inventory adjustment request not found", ar: "لم يتم العثور على طلب التعديل" } },
  INVALID_STATUS: { code: "INVENTORY_ADJUSTMENT_INVALID_STATUS", status: 409, message: { fr: "Statut invalide pour cette demande", en: "Invalid status for this request", ar: "حالة غير صالحة لهذا الطلب" } },
} as const satisfies Record<string, ErrorDef>;
