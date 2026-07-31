import { z } from "zod";

export const admin_list_stock_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  warehouse_id: z.string().max(255).optional(),
  search: z.string().max(255).optional(),
  low_stock: z.boolean().optional(),
  out_of_stock: z.boolean().optional(),
  sort_by: z.enum(["sku_code", "quantity_on_hand", "stock_available"]).optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
});

export const admin_list_movements_dto = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  warehouse_id: z.string().max(255).optional(),
  movement_type: z.string().max(32).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
