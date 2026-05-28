import "server-only";

import { eq, sql } from "drizzle-orm";
import z from "zod";

import { generate_id } from "@/lib/utils";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import type { report_review_dto } from "../models/review.dto";
import { review_repository } from "../repositories/review.repository";
import { product_reviews } from "../schema";
import { db } from "@/lib/db";

export class ReportService {
  async report(user_id: string, input: z.infer<typeof report_review_dto>) {
    const review = await review_repository.find_by_id(input.review_id);
    if (!review) throw new NotFoundError("Avis introuvable");
    if (review.user_id === user_id)
      throw new ConflictError("Impossible de signaler votre propre avis");

    try {
      await review_repository.create_report({
        id: generate_id(),
        review_id: input.review_id,
        reporter_user_id: user_id,
        reason: input.reason,
        details: input.details ?? null,
        status: "open",
      });
      await db
        .update(product_reviews)
        .set({ report_count: sql`${product_reviews.report_count} + 1` })
        .where(eq(product_reviews.id, input.review_id));
    } catch {
      throw new ConflictError("Signalement déjà envoyé");
    }

    return { ok: true };
  }
}
export const report_service = new ReportService();
