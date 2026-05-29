import { z } from "zod";

export const catalog_locale_enum = z.enum(["fr", "en"]);
export const catalog_sort_enum = z.enum([
  "relevance",
  "newest",
  "price_asc",
  "price_desc",
  "featured",
]);

const property_filter_record = z.record(
  z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
  z.array(z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)).min(1),
);

export const catalog_search_dto = z.object({
  locale: catalog_locale_enum.default("fr"),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  sort: catalog_sort_enum.default("relevance"),

  category_id: z.string().min(1).max(255).optional(),
  category_slug: z.string().min(1).max(255).optional(),
  include_descendants: z.coerce.boolean().default(true),

  brand_ids: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v == null ? undefined : Array.isArray(v) ? v : [v])),

  price_min: z.coerce.number().min(0).optional(),
  price_max: z.coerce.number().min(0).optional(),

  properties: z
    .union([z.string(), property_filter_record])
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      if (typeof v === "string") {
        try {
          return property_filter_record.parse(JSON.parse(v));
        } catch {
          return undefined;
        }
      }
      return v;
    }),

  in_stock_only: z.coerce.boolean().default(false),
  is_featured: z.coerce.boolean().optional(),
});

export const catalog_facets_dto = catalog_search_dto.omit({ page: true, limit: true, sort: true });

export type CatalogSearchInput = z.infer<typeof catalog_search_dto>;
export type CatalogFacetsInput = z.infer<typeof catalog_facets_dto>;
