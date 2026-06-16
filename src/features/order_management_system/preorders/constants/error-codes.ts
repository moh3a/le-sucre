import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const PREORDER_ERROR = {
  FULFILLMENT_INVENTORY_NOT_FOUND: {
    code: "PREORDER_FULFILLMENT_INVENTORY_NOT_FOUND",
    status: 404,
    message: {
      fr: "Niveau de stock introuvable pour ce SKU et entrepôt",
      en: "Inventory level not found for this SKU and warehouse",
      ar: "مستوى المخزون غير موجود لـ SKU والمستودع هذا",
    },
  },
  FULFILLMENT_NO_ALLOCATIONS: {
    code: "PREORDER_FULFILLMENT_NO_ALLOCATIONS",
    status: 404,
    message: {
      fr: "Aucune allocation de précommande confirmée à traiter",
      en: "No confirmed preorder allocations to fulfill",
      ar: "لا توجد تخصيصات طلب مسبق مؤكدة للتنفيذ",
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

export const AVAILABILITY_ERROR = {
  SKU_NOT_FOUND: {
    code: "AVAILABILITY_SKU_NOT_FOUND",
    status: 404,
    message: {
      fr: "SKU introuvable pour la vérification de disponibilité",
      en: "SKU not found for availability check",
      ar: "SKU غير موجود للتحقق من التوفر",
    },
  },
  WAREHOUSE_NOT_FOUND: {
    code: "AVAILABILITY_WAREHOUSE_NOT_FOUND",
    status: 404,
    message: {
      fr: "Entrepôt introuvable pour la vérification de disponibilité",
      en: "Warehouse not found for availability check",
      ar: "المستودع غير موجود للتحقق من التوفر",
    },
  },
} as const satisfies Record<string, ErrorDef>;
