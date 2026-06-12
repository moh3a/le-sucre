export type VariantChannel = "retail" | "wholesale";

export type VariantProperty = {
  id: string;
  product_id: string;
  code: string;
  name: string;
  sort_order: number;
  is_required: boolean;
};

export type VariantPropertyValue = {
  id: string;
  property_id: string;
  code: string;
  label: string;
  sort_order: number;
  metadata: Record<string, unknown>;
};

export type SkuRow = {
  id: string;
  product_id: string;
  sku_code: string;
  option_signature: string;
  barcode: string | null;
  base_price: string | null;
  offer_price: string | null;
  currency: string | null;
  is_active: boolean;
  stock_available: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SkuOptionValueRow = {
  sku_id: string;
  property_value_id: string;
};

export type SkuPriceRow = {
  id: string;
  sku_id: string;
  channel: VariantChannel;
  min_quantity: number;
  price: string;
  currency: string;
  valid_from: string | null;
  valid_to: string | null;
};

export type WholesaleRuleRow = {
  id: string;
  product_id: string | null;
  sku_id: string | null;
  min_quantity: number;
  price: string | null;
  discount_percent: string | null;
  currency: string;
  is_active: boolean;
};

export type OptionPair = {
  property_code: string;
  value_code: string;
};

export type SkuCombination = {
  signature: string;
  pairs: OptionPair[];
};

export type GenerateSkusResult = {
  created: number;
  skipped: number;
  capped: boolean;
  attempted: number;
};

export type PriceResolution = {
  unit_price: string;
  currency: string;
  source:
    | "sku_price_tier"
    | "wholesale_rule_sku"
    | "wholesale_rule_product"
    | "sku_offer"
    | "sku_base"
    | "product_offer"
    | "product_base";
};

export type SkuListRow = {
  sku_id: string;
  sku_code: string;
  option_signature: string;
  is_active: boolean;
  stock_available: number;
  base_price: string | null;
  offer_price: string | null;
  currency: string | null;
  options: Array<{
    property_code: string | null;
    value_code: string | null;
    value_label: string | null;
    value_id: string | null;
  }>;
};
