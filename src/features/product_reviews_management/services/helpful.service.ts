import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { HELPFUL_ERROR } from "../constants/error-codes";
import { review_repository } from "../repositories/review.repository";
import { product_reviews } from "../schema";
import { REVIEW_STATUS } from "../constants/review-status";
import { review_cache_service } from "./review-cache.service";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class HelpfulService {
  async vote(user_id: string, review_id: string) {
    const review = await review_repository.find_by_id(review_id);
    if (!review || review.status !== REVIEW_STATUS.approved) {
      throw_error(HELPFUL_ERROR.REVIEW_NOT_FOUND);
    }
    if (review.user_id === user_id)
      throw_error(HELPFUL_ERROR.ALREADY_VOTED);

    try {
      await review_repository.add_helpful_vote(review_id, user_id);
      await db
        .update(product_reviews)
        .set({ helpful_count: sql`${product_reviews.helpful_count} + 1` })
        .where(eq(product_reviews.id, review_id));
    } catch {
      throw_error(HELPFUL_ERROR.ALREADY_VOTED);
    }

    await review_cache_service.invalidate_product(review.product_id);
    void audit_service.log({
      action: "review.helpful.vote",
      resource_type: "review_id",
      resource_id: review_id,
    });
    return { ok: true };
  }

  async remove_vote(user_id: string, review_id: string) {
    const review = await review_repository.find_by_id(review_id);
    if (!review || review.status !== REVIEW_STATUS.approved) {
      throw_error(HELPFUL_ERROR.REVIEW_NOT_FOUND);
    }

    await review_repository.remove_helpful_vote(review_id, user_id);
    await db
      .update(product_reviews)
      .set({ helpful_count: sql`GREATEST(${product_reviews.helpful_count} - 1, 0)` })
      .where(eq(product_reviews.id, review_id));

    await review_cache_service.invalidate_product(review.product_id);
    void audit_service.log({
      action: "review.helpful.remove_vote",
      resource_type: "review_id",
      resource_id: review_id,
    });
    return { ok: true };
  }
}
export const helpful_service = new HelpfulService();
