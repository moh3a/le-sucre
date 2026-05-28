import { and, eq, SQL } from "drizzle-orm";
import { product_reviews } from "../schema";
import { REVIEW_STATUS } from "../constants/review-status";

export function build_public_review_filters(input: {
  product_id: string;
  rating?: number;
  verified_only?: boolean;
}) {
  const clauses: SQL[] = [
    eq(product_reviews.product_id, input.product_id),
    eq(product_reviews.status, REVIEW_STATUS.approved),
  ];
  if (input.rating) clauses.push(eq(product_reviews.rating, input.rating));
  if (input.verified_only) clauses.push(eq(product_reviews.is_verified_purchase, true));
  return and(...clauses);
}
