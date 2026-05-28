import { z } from "zod";
import { REVIEW_SORT } from "../constants/review-status";

export const review_rating_enum = z.number().int().min(1).max(5);

export const create_review_dto = z.object({
  product_id: z.string().min(1).max(255),
  order_id: z.string().min(1).max(255).optional(),
  order_item_id: z.string().min(1).max(255).optional(),
  rating: review_rating_enum,
  title: z.string().max(255).optional().nullable(),
  body: z.string().min(20).max(5000),
  locale: z.enum(["fr", "en"]).default("fr"),
});

export const list_product_reviews_dto = z.object({
  product_id: z.string().min(1).max(255),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z
    .enum([
      REVIEW_SORT.newest,
      REVIEW_SORT.oldest,
      REVIEW_SORT.highest_rating,
      REVIEW_SORT.lowest_rating,
      REVIEW_SORT.most_helpful,
    ])
    .default(REVIEW_SORT.newest),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  verified_only: z.coerce.boolean().default(false),
});

export const moderate_review_dto = z.object({
  review_id: z.string().min(1).max(255),
  status: z.enum(["approved", "rejected", "hidden"]),
  moderation_note: z.string().max(512).optional(),
});

export const admin_list_reviews_dto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  product_id: z.string().optional(),
});

export const helpful_vote_dto = z.object({ review_id: z.string().min(1).max(255) });

export const report_review_dto = z.object({
  review_id: z.string().min(1).max(255),
  reason: z.enum(["spam", "abuse", "off_topic", "fake", "other"]),
  details: z.string().max(1000).optional(),
});
