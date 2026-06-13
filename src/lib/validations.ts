import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────
export const cuidSchema = z.string().cuid();
export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const emailSchema = z.string().email().toLowerCase().trim();
export const passwordSchema = z.string().min(8).max(100);
export const phoneNumberSchema = z
  .string()
  .regex(new RegExp(/^(0)(5|6|7)[0-9]{8}$/), {
    message: "Invalid algerian phone number",
  })
  .length(10, { message: "Invalid algerian phone number" });

export const urlSchema = z.string().url();

// ─── Pagination ───────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
});

// ─── Sort ─────────────────────────────────────────────────
export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export function sortSchema<T extends string>(fields: [T, ...T[]]) {
  return z.object({
    sort_by: z.enum(fields).optional(),
    sort_order: sortOrderSchema,
  });
}

// ─── Search ───────────────────────────────────────────────
export const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
});

// ─── Money ────────────────────────────────────────────────
export const moneySchema = z.object({
  amount: z.number().int().nonnegative(), // in cents
  currency: z.string().length(3).default("EUR"),
});

export const priceSchema = z.coerce
  .number()
  .int()
  .nonnegative()
  .describe("Price in cents (e.g. 1999 = €19.99)");

// ─── Address ──────────────────────────────────────────────
export const addressSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  postal_code: z.string().min(1).max(20),
  country_code: z.string().length(2).toUpperCase(),
  phone: phoneNumberSchema,
});

export type Address = z.infer<typeof addressSchema>;

// ─── Image ────────────────────────────────────────────────
export const imageSchema = z.object({
  url: urlSchema,
  alt: z.string().max(200).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  is_primary: z.boolean().default(false),
});

export type ImageInput = z.infer<typeof imageSchema>;

// ─── Status filters ───────────────────────────────────────
export const activeStatusSchema = z.enum(["active", "inactive", "archived"]);
export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

// ─── ID param ─────────────────────────────────────────────
export const idParamSchema = z.object({ id: cuidSchema });
export const slugParamSchema = z.object({ slug: slugSchema });
