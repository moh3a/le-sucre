import type { ErrorDef } from "@/features/inventory_management_system/shared/error-codes";

export const CHECKOUT_ERROR = {
  CART_EMPTY: {
    code: "CHECKOUT_CART_EMPTY",
    status: 400,
    message: {
      fr: "Impossible de commander avec un panier vide",
      en: "Cannot checkout with an empty cart",
      ar: "لا يمكن إتمام الشراء بعربة فارغة",
    },
  },
  CART_NOT_FOUND: {
    code: "CHECKOUT_CART_NOT_FOUND",
    status: 404,
    message: {
      fr: "Panier introuvable",
      en: "Cart not found",
      ar: "العربة غير موجودة",
    },
  },
  INVALID_SHIPPING_ADDRESS: {
    code: "CHECKOUT_INVALID_SHIPPING_ADDRESS",
    status: 400,
    message: {
      fr: "Adresse de livraison invalide",
      en: "Invalid shipping address",
      ar: "عنوان الشحن غير صالح",
    },
  },
  INVALID_BILLING_ADDRESS: {
    code: "CHECKOUT_INVALID_BILLING_ADDRESS",
    status: 400,
    message: {
      fr: "Adresse de facturation invalide",
      en: "Invalid billing address",
      ar: "عنوان الفوترة غير صالح",
    },
  },
  SHIPPING_METHOD_UNAVAILABLE: {
    code: "CHECKOUT_SHIPPING_METHOD_UNAVAILABLE",
    status: 400,
    message: {
      fr: "Mode de livraison indisponible pour cette adresse",
      en: "Shipping method is not available for this address",
      ar: "طريقة الشحن غير متاحة لهذا العنوان",
    },
  },
  PAYMENT_METHOD_UNAVAILABLE: {
    code: "CHECKOUT_PAYMENT_METHOD_UNAVAILABLE",
    status: 400,
    message: {
      fr: "Mode de paiement indisponible",
      en: "Payment method is not available",
      ar: "طريقة الدفع غير متاحة",
    },
  },
  ITEMS_UNAVAILABLE: {
    code: "CHECKOUT_ITEMS_UNAVAILABLE",
    status: 409,
    message: {
      fr: "Certains articles du panier ne sont plus disponibles",
      en: "Some items in the cart are no longer available",
      ar: "بعض العناصر في العربة لم تعد متاحة",
    },
  },
  PRICES_CHANGED: {
    code: "CHECKOUT_PRICES_CHANGED",
    status: 409,
    message: {
      fr: "Certains prix ont changé depuis la création du panier",
      en: "Some prices have changed since the cart was created",
      ar: "تغيرت بعض الأسعار منذ إنشاء العربة",
    },
  },
  PROMO_CODE_INVALID: {
    code: "CHECKOUT_PROMO_CODE_INVALID",
    status: 400,
    message: {
      fr: "Code promo invalide ou expiré",
      en: "Invalid or expired promo code",
      ar: "رمز ترويجي غير صالح أو منتهي الصلاحية",
    },
  },
} as const satisfies Record<string, ErrorDef>;
