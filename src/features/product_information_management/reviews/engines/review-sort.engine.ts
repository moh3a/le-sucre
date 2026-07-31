import { asc, desc } from "drizzle-orm";
import { product_reviews } from "../schema";
import { REVIEW_SORT } from "../constants/review-status";

export function review_order_by(sort: string) {
  switch (sort) {
    case REVIEW_SORT.oldest:
      return [asc(product_reviews.created_at)];
    case REVIEW_SORT.highest_rating:
      return [desc(product_reviews.rating), desc(product_reviews.created_at)];
    case REVIEW_SORT.lowest_rating:
      return [asc(product_reviews.rating), desc(product_reviews.created_at)];
    case REVIEW_SORT.most_helpful:
      return [desc(product_reviews.helpful_count), desc(product_reviews.created_at)];
    case REVIEW_SORT.newest:
    default:
      return [desc(product_reviews.created_at)];
  }
}
