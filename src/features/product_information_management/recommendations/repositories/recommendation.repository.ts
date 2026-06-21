// repositories/recommendation.repository.ts
import "server-only";
import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
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

  async get_all_edges(source_product_id: string) {
    return db
      .select({
        id: product_recommendation_edges.id,
        target_product_id: product_recommendation_edges.target_product_id,
        recommendation_type: product_recommendation_edges.recommendation_type,
        score: product_recommendation_edges.score,
        rank: product_recommendation_edges.rank,
        signals: product_recommendation_edges.signals,
        computed_at: product_recommendation_edges.computed_at,
        created_at: product_recommendation_edges.created_at,
      })
      .from(product_recommendation_edges)
      .where(eq(product_recommendation_edges.source_product_id, source_product_id))
      .orderBy(
        product_recommendation_edges.recommendation_type,
        product_recommendation_edges.rank,
      );
  }

  async add_edge(data: {
    source_product_id: string;
    target_product_id: string;
    recommendation_type: string;
    score: number;
  }) {
    const max_rank = await db
      .select({ max_rank: db.fn.max(product_recommendation_edges.rank) })
      .from(product_recommendation_edges)
      .where(
        and(
          eq(product_recommendation_edges.source_product_id, data.source_product_id),
          eq(product_recommendation_edges.recommendation_type, data.recommendation_type),
        ),
      )
      .then((rows) => (rows[0]?.max_rank ?? 0) + 1);

    return db.insert(product_recommendation_edges).values({
      source_product_id: data.source_product_id,
      target_product_id: data.target_product_id,
      recommendation_type: data.recommendation_type,
      score: String(data.score),
      rank: max_rank,
      signals: {},
      computed_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
  }

  async delete_edge_by_id(edge_id: string) {
    return db
      .delete(product_recommendation_edges)
      .where(eq(product_recommendation_edges.id, edge_id));
  }

  async get_edge_counts(source_product_id: string) {
    const rows = await db
      .select({
        recommendation_type: product_recommendation_edges.recommendation_type,
        count: db.fn.count(),
      })
      .from(product_recommendation_edges)
      .where(eq(product_recommendation_edges.source_product_id, source_product_id))
      .groupBy(product_recommendation_edges.recommendation_type);
    return rows;
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
