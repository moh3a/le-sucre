import { z } from "zod";

export const login_dto = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const register_dto = z.object({
  name: z.string().min(2).max(255),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const assign_role_dto = z.object({
  user_id: z.string().length(24),
  role_name: z.enum(["admin", "moderator", "operator", "delivery_person", "customer"]),
});

export type LoginInput = z.infer<typeof login_dto>;
