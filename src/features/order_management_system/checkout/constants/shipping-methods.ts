export interface ShippingMethodEntry {
  id: string;
  cost: number;
  name_key: string;
  description_key: string;
}

export const SHIPPING_METHODS: ShippingMethodEntry[] = [
  {
    id: "standard",
    cost: 0,
    name_key: "shipping_standard_name",
    description_key: "shipping_standard_desc",
  },
  {
    id: "express",
    cost: 1500,
    name_key: "shipping_express_name",
    description_key: "shipping_express_desc",
  },
  {
    id: "sameday",
    cost: 2500,
    name_key: "shipping_sameday_name",
    description_key: "shipping_sameday_desc",
  },
];

const SHIPPING_METHOD_MAP = new Map<string, ShippingMethodEntry>(
  SHIPPING_METHODS.map((method) => [method.id, method]),
);

export function find_shipping_method(id: string | null | undefined) {
  if (!id) return undefined;
  return SHIPPING_METHOD_MAP.get(id);
}

export function resolve_shipping_cost(id: string | null | undefined, fallback = 0) {
  return find_shipping_method(id)?.cost ?? fallback;
}
