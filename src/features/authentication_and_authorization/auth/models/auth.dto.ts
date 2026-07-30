import { z } from "zod";

const phone_regex = /^\+?[\d\s\-()]{7,20}$/;
const phone_error = "Numéro de téléphone invalide / Invalid phone number";

export const login_dto = z.object({
  identifier: z.string().min(1, "Email ou téléphone requis / Email or phone required"),
  password: z.string().min(8).max(128),
  remember_me: z.boolean().default(false).optional(),
});

export const register_dto = z
  .object({
    name: z.string().min(2).max(255),
    email: z.string().email("Email invalide / Invalid email").optional().or(z.literal("")),
    phone: z.string().regex(phone_regex, phone_error).optional().or(z.literal("")),
    password: z.string().min(8).max(128),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email ou téléphone requis / Email or phone required",
  });

export const assign_role_dto = z.object({
  user_id: z.string().min(1),
  role_name: z.enum(["admin", "moderator", "operator", "delivery_person", "customer"]),
});

export const create_user_dto = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().regex(phone_regex, phone_error),
  password: z.string().min(8).max(128),
  role: z
    .enum(["admin", "moderator", "operator", "delivery_person", "customer"])
    .default("customer"),
  email: z.string().email().optional(),
  address_line_1: z.string().min(1).max(500).optional(),
  address_line_2: z.string().max(500).optional(),
  city: z.string().min(1).max(255).optional(),
  state: z.string().max(255).optional(),
  postal_code: z.string().max(50).optional(),
});

export type LoginInput = z.infer<typeof login_dto>;
export type CreateUserInput = z.infer<typeof create_user_dto>;
