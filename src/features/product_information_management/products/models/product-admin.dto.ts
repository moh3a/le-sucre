import { z } from "zod";
import { product_status_enum } from "./product.dto";

export const admin_list_products_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
  status: product_status_enum.optional(),
  brand_id: z.string().optional(),
  category_id: z.string().optional(),
  stock_status: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
  price_min: z.coerce.number().min(0).optional(),
  price_max: z.coerce.number().min(0).optional(),
  rating_min: z.coerce.number().min(0).max(5).optional(),
  rating_max: z.coerce.number().min(0).max(5).optional(),
});

export const bulk_product_action_dto = z.object({
  product_ids: z.array(z.string()).min(1).max(200),
  action: z.enum(["activate", "deactivate", "delete", "assign_category"]),
  category_id: z.string().optional(),
});
