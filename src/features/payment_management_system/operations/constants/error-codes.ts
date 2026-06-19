import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const PAYMENT_OPERATIONS_ERROR = {
  VERIFICATION_NOT_FOUND: { code: "PAYMENT_VERIFICATION_NOT_FOUND", status: 404, message: { fr: "Vérification de paiement introuvable", en: "Payment verification not found", ar: "لم يتم العثور على التحقق من الدفع" } },
  REFUND_REQUEST_NOT_FOUND: { code: "REFUND_REQUEST_NOT_FOUND", status: 404, message: { fr: "Demande de remboursement introuvable", en: "Refund request not found", ar: "لم يتم العثور على طلب استرداد" } },
} as const satisfies Record<string, ErrorDef>;
