import type { z } from "zod";

import { ValidationError } from "@/lib/error_handling";

import { assign_role_dto, login_dto, register_dto } from "./models/auth.dto";
import { normalize_phone } from "./services/phone-auth.service";

function is_email(value: string): boolean {
  return value.includes("@");
}

function zod_field_errors(error: z.ZodError): Record<string, unknown> {
  return { fields: error.flatten().fieldErrors };
}

export function validate_login(input: unknown) {
  const result = login_dto.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation échouée", zod_field_errors(result.error));
  }
  const data = result.data;
  if (is_email(data.identifier)) {
    return { ...data, email: data.identifier.trim().toLowerCase() };
  }
  return { ...data, phone: normalize_phone(data.identifier) };
}

export function validate_register(input: unknown) {
  const result = register_dto.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation échouée", zod_field_errors(result.error));
  }
  const data = result.data;
  const phone = data.phone ? normalize_phone(data.phone) : undefined;
  const email = data.email ? data.email.trim().toLowerCase() : undefined;
  return { ...data, phone, email };
}

export function validate_assign_role(input: unknown) {
  const result = assign_role_dto.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation échouée", zod_field_errors(result.error));
  }
  return result.data;
}
