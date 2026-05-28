import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { product_reviews, product_review_aggregates } from "../schema";
import { REVIEW_STATUS } from "../constants/review-status";

export async function recompute_product_rating_aggregate(product_id: string) {
  const [row] = await db
    .select({
      review_count: sql<number>`COUNT(*)`.mapWith(Number),
      average_rating: sql<string>`ROUND(AVG(${product_reviews.rating}), 2)`,
      rating_1: sql<number>`SUM(CASE WHEN ${product_reviews.rating}=1 THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
      rating_2: sql<number>`SUM(CASE WHEN ${product_reviews.rating}=2 THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
      rating_3: sql<number>`SUM(CASE WHEN ${product_reviews.rating}=3 THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
      rating_4: sql<number>`SUM(CASE WHEN ${product_reviews.rating}=4 THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
      rating_5: sql<number>`SUM(CASE WHEN ${product_reviews.rating}=5 THEN 1 ELSE 0 END)`.mapWith(
        Number,
      ),
    })
    .from(product_reviews)
    .where(
      and(
        eq(product_reviews.product_id, product_id),
        eq(product_reviews.status, REVIEW_STATUS.approved),
      ),
    );

  const payload = {
    product_id,
    review_count: row?.review_count ?? 0,
    average_rating: row?.review_count ? String(row.average_rating ?? "0") : "0",
    rating_1: row?.rating_1 ?? 0,
    rating_2: row?.rating_2 ?? 0,
    rating_3: row?.rating_3 ?? 0,
    rating_4: row?.rating_4 ?? 0,
    rating_5: row?.rating_5 ?? 0,
    updated_at: new Date().toISOString(),
  };

  await db
    .insert(product_review_aggregates)
    .values(payload)
    .onDuplicateKeyUpdate({
      set: {
        review_count: payload.review_count,
        average_rating: payload.average_rating,
        rating_1: payload.rating_1,
        rating_2: payload.rating_2,
        rating_3: payload.rating_3,
        rating_4: payload.rating_4,
        rating_5: payload.rating_5,
        updated_at: payload.updated_at,
      },
    });

  return payload;
}
