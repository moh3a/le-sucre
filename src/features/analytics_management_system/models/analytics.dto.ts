import { z } from "zod";
import { ANALYTICS_EVENT } from "../constants/event-types";

export const ingest_event_dto = z.object({
  event_type: z.enum([
    ANALYTICS_EVENT.product_view,
    ANALYTICS_EVENT.add_to_cart,
    ANALYTICS_EVENT.checkout_started,
    ANALYTICS_EVENT.search,
    ANALYTICS_EVENT.click,
    ANALYTICS_EVENT.wishlist_add,
    ANALYTICS_EVENT.recommendation_click,
  ]),
  session_key: z.string().min(8).max(64).optional(),
  product_id: z.string().max(24).optional(),
  sku_id: z.string().max(24).optional(),
  category_id: z.string().max(255).optional(),
  brand_id: z.string().max(24).optional(),
  cart_id: z.string().max(24).optional(),
  search_query: z.string().max(512).optional(),
  campaign_id: z.string().max(64).optional(),
  slot_type: z.string().max(64).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const batch_ingest_dto = z.object({
  events: z.array(ingest_event_dto).min(1).max(50),
});

export const date_range_dto = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const product_analytics_query_dto = date_range_dto.extend({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["revenue", "views", "conversion"]).default("revenue"),
});

export const search_analytics_query_dto = date_range_dto.extend({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
