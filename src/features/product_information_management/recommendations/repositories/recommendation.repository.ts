// repositories/recommendation.repository.ts
import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { product_recommendation_edges } from "../schema";
import type { ScoredCandidate } from "../types";

export class RecommendationRepository {
  async get_precomputed(source_product_id: string, recommendation_type: string, limit: number) {
    return db
      .select({
        target_product_id: product_recommendation_edges.target_product_id,
        score: product_recommendation_edges.score,
        signals: product_recommendation_edges.signals,
        rank: product_recommendation_edges.rank,
      })
      .from(product_recommendation_edges)
      .where(
        and(
          eq(product_recommendation_edges.source_product_id, source_product_id),
          eq(product_recommendation_edges.recommendation_type, recommendation_type),
        ),
      )
      .orderBy(product_recommendation_edges.rank)
      .limit(limit);
  }

  async replace_edges(
    source_product_id: string,
    recommendation_type: string,
    candidates: ScoredCandidate[],
    computed_at: string,
  ) {
    await db
      .delete(product_recommendation_edges)
      .where(
        and(
          eq(product_recommendation_edges.source_product_id, source_product_id),
          eq(product_recommendation_edges.recommendation_type, recommendation_type),
        ),
      );

    if (!candidates.length) return;

    await db.insert(product_recommendation_edges).values(
      candidates.slice(0, 50).map((c, idx) => ({
        source_product_id,
        target_product_id: c.product_id,
        recommendation_type,
        score: String(c.score),
        rank: idx + 1,
        signals: c.signals,
        computed_at,
      })),
    );
  }
}
export const recommendation_repository = new RecommendationRepository();
