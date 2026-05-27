import { ValidationError } from "@/lib/error_handling";
import {
  create_product_dto,
  update_product_dto,
  list_products_dto,
  upsert_translation_dto,
  product_media_dto,
} from "../models/product.dto";

function parse<T>(
  schema: {
    safeParse: (i: unknown) => { success: boolean; data?: T; error?: { flatten: () => unknown } };
  },
  input: unknown,
): T {
  const r = schema.safeParse(input);
  if (!r.success) throw new ValidationError("Validation échouée", { fields: r.error!.flatten() });
  return r.data as T;
}

export const validate_create_product = (i: unknown) => parse(create_product_dto, i);
export const validate_update_product = (i: unknown) => parse(update_product_dto, i);
export const validate_list_products = (i: unknown) => parse(list_products_dto, i);
export const validate_upsert_translation = (i: unknown) => parse(upsert_translation_dto, i);
export const validate_product_media = (i: unknown) => parse(product_media_dto, i);
