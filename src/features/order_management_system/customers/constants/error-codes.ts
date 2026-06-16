import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const CUSTOMER_ERROR = {
  NOT_FOUND: {
    code: "CUSTOMER_NOT_FOUND",
    status: 404,
    message: {
      fr: "Client introuvable",
      en: "Customer not found",
      ar: "العميل غير موجود",
    },
  },
  SEGMENTATION_FAILED: {
    code: "CUSTOMER_SEGMENTATION_FAILED",
    status: 500,
    message: {
      fr: "Échec du calcul de la segmentation client",
      en: "Customer segmentation calculation failed",
      ar: "فشل حساب تقسيم العملاء",
    },
  },
} as const satisfies Record<string, ErrorDef>;
