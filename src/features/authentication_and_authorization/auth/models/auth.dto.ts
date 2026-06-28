import { z } from "zod";

const phone_regex = /^\+?[\d\s\-()]{7,20}$/;
const phone_error = "Numéro de téléphone invalide / Invalid phone number";

export const login_dto = z.object({
  phone: z.string().regex(phone_regex, phone_error),
  password: z.string().min(8).max(128),
  remember_me: z.boolean().default(false).optional(),
});

export const register_dto = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().regex(phone_regex, phone_error),
  password: z.string().min(8).max(128),
});

export const assign_role_dto = z.object({
  user_id: z.string().min(1),
  role_name: z.enum(["admin", "moderator", "operator", "delivery_person", "customer"]),
});

export const create_user_dto = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().regex(phone_regex, phone_error),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "moderator", "operator", "delivery_person", "customer"]).default("customer"),
});

export type LoginInput = z.infer<typeof login_dto>;
export type CreateUserInput = z.infer<typeof create_user_dto>;
