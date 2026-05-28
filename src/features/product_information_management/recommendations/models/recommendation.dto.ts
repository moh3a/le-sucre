import { z } from "zod";
import { RECOMMENDATION_TYPE } from "../constants/recommendation-types";

export const product_recommendations_query_dto = z.object({
  product_id: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  locale: z.enum(["fr", "en", "ar"]).default("fr"),
  types: z
    .array(
      z.enum([RECOMMENDATION_TYPE.similar, RECOMMENDATION_TYPE.related, RECOMMENDATION_TYPE.fbt]),
    )
    .default([RECOMMENDATION_TYPE.similar, RECOMMENDATION_TYPE.related]),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});

export const trending_query_dto = z.object({
  locale: z.enum(["fr", "en", "ar"]).default("fr"),
  period: z.enum(["day", "week"]).default("week"),
  limit: z.coerce.number().int().min(1).max(48).default(16),
});

export const track_product_view_dto = z.object({
  product_id: z.string().min(1).max(255),
  session_key: z.string().min(8).max(64).optional(),
});

export const recommendation_analytics_event_dto = z.object({
  event_type: z.enum(["impression", "click"]),
  slot_type: z.string().min(1).max(64),
  source_product_id: z.string().optional(),
  target_product_id: z.string().min(1).max(255),
  session_key: z.string().max(64).optional(),
});

export const for_you_query_dto = z.object({
  locale: z.enum(["fr", "en", "ar"]).default("fr"),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});

export const recent_query_dto = z.object({
  locale: z.enum(["fr", "en", "ar"]).default("fr"),
  session_key: z.string().min(8).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(24).default(12),
});
