import { ValidationError } from "@/lib/error_handling";
import {
  create_category_dto,
  update_category_dto,
  move_category_dto,
  list_categories_dto,
  filter_by_category_dto,
} from "../models/category.dto";

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

export const validate_create_category = (i: unknown) => parse(create_category_dto, i);
export const validate_update_category = (i: unknown) => parse(update_category_dto, i);
export const validate_move_category = (i: unknown) => parse(move_category_dto, i);
export const validate_list_categories = (i: unknown) => parse(list_categories_dto, i);
export const validate_filter_by_category = (i: unknown) => parse(filter_by_category_dto, i);
