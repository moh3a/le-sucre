export interface PaymentMethodEntry {
  id: string;
  label_key: string;
}

export const CHECKOUT_PAYMENT_METHODS: PaymentMethodEntry[] = [
  { id: "cod", label_key: "payment_cod" },
  { id: "cib", label_key: "payment_cib" },
  { id: "satim", label_key: "payment_satim" },
];

const PAYMENT_METHOD_MAP = new Map<string, PaymentMethodEntry>(
  CHECKOUT_PAYMENT_METHODS.map((method) => [method.id, method]),
);

export function is_checkout_payment_method(id: string | null | undefined) {
  return !!id && PAYMENT_METHOD_MAP.has(id);
}
