import type { z } from "zod";

import { ValidationError } from "@/lib/error_handling";

import { assign_role_dto, login_dto, register_dto } from "./models/auth.dto";
import { normalize_phone } from "./services/phone-auth.service";

function zod_field_errors(error: z.ZodError): Record<string, unknown> {
  return { fields: error.flatten().fieldErrors };
}

export function validate_login(input: unknown) {
  const result = login_dto.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation échouée", zod_field_errors(result.error));
  }
  return { ...result.data, phone: normalize_phone(result.data.phone) };
}

export function validate_register(input: unknown) {
  const result = register_dto.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation échouée", zod_field_errors(result.error));
  }
  return { ...result.data, phone: normalize_phone(result.data.phone) };
}

export function validate_assign_role(input: unknown) {
  const result = assign_role_dto.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation échouée", zod_field_errors(result.error));
  }
  return result.data;
}
