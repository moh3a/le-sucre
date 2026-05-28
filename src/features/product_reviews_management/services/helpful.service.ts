import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { review_repository } from "../repositories/review.repository";
import { product_reviews } from "../schema";
import { REVIEW_STATUS } from "../constants/review-status";
import { review_cache_service } from "./review-cache.service";

export class HelpfulService {
  async vote(user_id: string, review_id: string) {
    const review = await review_repository.find_by_id(review_id);
    if (!review || review.status !== REVIEW_STATUS.approved) {
      throw new NotFoundError("Avis introuvable");
    }
    if (review.user_id === user_id)
      throw new ConflictError("Vous ne pouvez pas voter votre propre avis");

    try {
      await review_repository.add_helpful_vote(review_id, user_id);
      await db
        .update(product_reviews)
        .set({ helpful_count: sql`${product_reviews.helpful_count} + 1` })
        .where(eq(product_reviews.id, review_id));
    } catch {
      throw new ConflictError("Vote déjà enregistré");
    }

    await review_cache_service.invalidate_product(review.product_id);
    return { ok: true };
  }
}
export const helpful_service = new HelpfulService();
