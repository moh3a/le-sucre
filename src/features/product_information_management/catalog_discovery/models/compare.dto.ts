import { z } from "zod";

export const compare_product_dto = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  image_url: z.string().nullable(),
  brand_name: z.string().nullable(),
  base_price: z.number(),
  offer_price: z.number().nullable(),
  currency: z.string(),
  average_rating: z.number().default(0),
  review_count: z.number().default(0),
  in_stock: z.boolean().default(true),
  description: z.string().nullable(),
  specs: z.array(z.object({ label: z.string(), value: z.string() })),
});

export const compare_response_dto = z.object({
  products: z.array(compare_product_dto),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    })
    .nullable(),
});

export type CompareProductData = z.infer<typeof compare_product_dto>;
export type CompareResponse = z.infer<typeof compare_response_dto>;
