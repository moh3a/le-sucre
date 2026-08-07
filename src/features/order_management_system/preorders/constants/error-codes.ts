import type { ErrorDef } from "@/features/fulfillment_management_system/shared/error-codes";

export const PREORDER_ERROR = {
  SKU_OUT_OF_STOCK: {
    code: "PREORDER_SKU_OUT_OF_STOCK",
    status: 409,
    message: {
      fr: "Ce produit ne peut pas être précommandé actuellement",
      en: "This product cannot be preordered at the moment",
      ar: "لا يمكن طلب هذا المنتج مسبقًا حاليًا",
    },
  },
  PREORDER_CAP_EXCEEDED: {
    code: "PREORDER_CAP_EXCEEDED",
    status: 409,
    message: {
      fr: "La quantité demandée dépasse la limite de précommande",
      en: "Requested quantity exceeds the preorder limit",
      ar: "الكمية المطلوبة تتجاوز حد الطلب المسبق",
    },
  },
  ALLOCATION_NOT_FOUND: {
    code: "PREORDER_ALLOCATION_NOT_FOUND",
    status: 404,
    message: {
      fr: "Allocation de précommande introuvable",
      en: "Preorder allocation not found",
      ar: "تخصيص الطلب المسبق غير موجود",
    },
  },
  ALLOCATION_ALREADY_CONFIRMED: {
    code: "PREORDER_ALLOCATION_ALREADY_CONFIRMED",
    status: 409,
    message: {
      fr: "Allocation déjà confirmée",
      en: "Allocation already confirmed",
      ar: "التخصيص مؤكد بالفعل",
    },
  },
  ALLOCATION_CANCELLED: {
    code: "PREORDER_ALLOCATION_CANCELLED",
    status: 410,
    message: {
      fr: "L'allocation a été annulée",
      en: "Allocation has been cancelled",
      ar: "تم إلغاء التخصيص",
    },
  },
  ALLOCATION_EXPIRED: {
    code: "PREORDER_ALLOCATION_EXPIRED",
    status: 410,
    message: {
      fr: "L'allocation a expiré",
      en: "Allocation has expired",
      ar: "انتهت صلاحية التخصيص",
    },
  },
} as const satisfies Record<string, ErrorDef>;
