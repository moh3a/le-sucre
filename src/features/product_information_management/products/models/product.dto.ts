import { z } from "zod";

export const product_status_enum = z.enum(["draft", "published", "archived"]);
export type ProductStatus = z.infer<typeof product_status_enum>;

export const product_details_dto = z.object({
  id: z.string().min(1).max(255),
  category_id: z.string().min(1).max(255),
  brand_id: z.string().min(1).max(255).optional().nullable(),
  sku: z.string().min(1).max(64),
  slug: z
    .string()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  base_price: z.coerce.number().min(0),
  offer_price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().length(3).default("DZD"),
  status: product_status_enum.default("draft"),
  is_featured: z.boolean().default(false),
  has_variants: z.boolean().default(false),
  metadata: z.string().optional(),
  seo_title: z.string().max(255).optional().nullable(),
  seo_description: z.string().max(500).optional().nullable(),
  seo_keywords: z.string().max(512).optional().nullable(),
  created_at: z.string().min(1).max(255),
  updated_at: z.string().min(1).max(255),
});

export const create_product_dto = product_details_dto
  .omit({ id: true, created_at: true, updated_at: true, seo_keywords: true })
  .extend({
    // default locale (e.g. fr) – required
    name: z.string().min(2).max(255),
    description: z.string().optional().nullable(),
    keywords: z.string().max(512).optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  });

export const update_product_dto = create_product_dto.partial().extend({
  id: z.string().min(1).max(255),
});

export const delete_media_dto = z.object({
  product_id: z.string().min(1).max(255),
  media_id: z.string().min(1).max(255),
});

export const upload_intent_dto = z.object({
  product_id: z.string().min(1).max(255),
  filename: z.string().min(1).max(255),
  mime_type: z.string().min(1).max(128),
});

export const upsert_translation_dto = z.object({
  product_id: z.string().min(1).max(255),
  locale: z.string().min(2).max(5),
  name: z.string().min(2).max(255),
  description: z.string().optional().nullable(),
  keywords: z.string().max(512).optional().nullable(),
  seo_title: z.string().max(255).optional().nullable(),
  seo_description: z.string().max(500).optional().nullable(),
});

export const list_products_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
  status: product_status_enum.optional(),
  brand_id: z.string().min(1).max(255).optional(),
  category_id: z.string().min(1).max(255).optional(),
});

export const product_media_dto = z.object({
  product_id: z.string().min(1).max(255),
  url: z.string().url(),
  filename: z.string().max(255).optional(),
  mime_type: z.string().max(128).optional(),
  kind: z.enum(["image", "video", "document"]).default("image"),
  alt: z.string().max(255).optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
  is_primary: z.boolean().default(false),
});

export const full_product_media_dto = product_media_dto.extend({
  id: z.string().min(1).max(255),
  created_at: z.string().min(1).max(255),
});
