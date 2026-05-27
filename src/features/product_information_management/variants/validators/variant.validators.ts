import { ValidationError } from "@/lib/error_handling";

import {
  create_property_dto,
  update_property_dto,
  create_property_value_dto,
  update_property_value_dto,
  generate_skus_dto,
  create_sku_dto,
  update_sku_dto,
  set_sku_price_tier_dto,
  delete_sku_price_tier_dto,
  upsert_wholesale_rule_dto,
  delete_wholesale_rule_dto,
  resolve_price_dto,
} from "../models/variant.dto";

function parse<T>(
  schema: {
    safeParse: (i: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } };
  },
  input: unknown,
): T {
  const r = schema.safeParse(input);
  if (!r.success) {
    throw new ValidationError("Validation échouée", { fields: r.error!.flatten() });
  }
  return r.data as T;
}

export const validate_create_property = (i: unknown) => parse(create_property_dto, i);
export const validate_update_property = (i: unknown) => parse(update_property_dto, i);

export const validate_create_property_value = (i: unknown) => parse(create_property_value_dto, i);
export const validate_update_property_value = (i: unknown) => parse(update_property_value_dto, i);

export const validate_generate_skus = (i: unknown) => parse(generate_skus_dto, i);

export const validate_create_sku = (i: unknown) => parse(create_sku_dto, i);
export const validate_update_sku = (i: unknown) => parse(update_sku_dto, i);

export const validate_set_sku_price_tier = (i: unknown) => parse(set_sku_price_tier_dto, i);
export const validate_delete_sku_price_tier = (i: unknown) => parse(delete_sku_price_tier_dto, i);

export const validate_upsert_wholesale_rule = (i: unknown) => parse(upsert_wholesale_rule_dto, i);
export const validate_delete_wholesale_rule = (i: unknown) => parse(delete_wholesale_rule_dto, i);

export const validate_resolve_price = (i: unknown) => parse(resolve_price_dto, i);
