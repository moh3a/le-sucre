import { z } from "zod";

export const wishlist_analytics_query_dto = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
});

export const product_wishlist_stats_dto = z.object({
  product_id: z.string().min(1),
});

export const customer_wishlist_analytics_dto = z.object({
  customer_id: z.string().min(1),
});

export const wishlist_analytics_export_dto = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  format: z.enum(["json", "csv"]).default("json"),
});
