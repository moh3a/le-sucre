import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { order_items, orders } from "@/features/order_management_system/orders/schema";
import { product_co_purchase_stats } from "../schema";
import { SCORING_WEIGHTS } from "../constants/scoring-weights";
import type { ScoredCandidate } from "../types";

export async function rebuild_co_purchase_window(window_days = 90) {
  await db.execute(sql`
    INSERT INTO product_co_purchase_stats (id, product_a_id, product_b_id, pair_count, score, window_days, updated_at)
    SELECT
      SUBSTRING(REPLACE(UUID(), '-', ''), 1, 24),
      LEAST(a.product_id, b.product_id),
      GREATEST(a.product_id, b.product_id),
      COUNT(*) AS pair_count,
      LOG(1 + COUNT(*)) AS score,
      ${window_days},
      NOW()
    FROM order_items a
    INNER JOIN order_items b ON a.order_id = b.order_id AND a.product_id < b.product_id
    INNER JOIN orders o ON o.id = a.order_id
    WHERE o.payment_status = 'paid'
      AND o.placed_at >= DATE_SUB(NOW(), INTERVAL ${window_days} DAY)
    GROUP BY LEAST(a.product_id, b.product_id), GREATEST(a.product_id, b.product_id)
    ON DUPLICATE KEY UPDATE
      pair_count = VALUES(pair_count),
      score = VALUES(score),
      updated_at = NOW()
  `);
}

export async function get_fbt_candidates(
  product_id: string,
  limit = 20,
): Promise<ScoredCandidate[]> {
  const rows = await db
    .select({
      product_id: product_co_purchase_stats.product_b_id,
      score: product_co_purchase_stats.score,
      pair_count: product_co_purchase_stats.pair_count,
    })
    .from(product_co_purchase_stats)
    .where(eq(product_co_purchase_stats.product_a_id, product_id))
    .orderBy(desc(product_co_purchase_stats.score))
    .limit(limit);

  const reverse = await db
    .select({
      product_id: product_co_purchase_stats.product_a_id,
      score: product_co_purchase_stats.score,
      pair_count: product_co_purchase_stats.pair_count,
    })
    .from(product_co_purchase_stats)
    .where(eq(product_co_purchase_stats.product_b_id, product_id))
    .orderBy(desc(product_co_purchase_stats.score))
    .limit(limit);

  const merged = new Map<string, ScoredCandidate>();
  for (const row of [...rows, ...reverse]) {
    merged.set(row.product_id, {
      product_id: row.product_id,
      score: Number(row.score) * SCORING_WEIGHTS.co_purchase,
      signals: { co_purchase: Number(row.score), pair_count: row.pair_count },
    });
  }
  return [...merged.values()].sort((a, b) => b.score - a.score);
}

export async function get_personalized_from_orders(user_id: string, limit = 30) {
  const rows = await db
    .select({ product_id: order_items.product_id, cnt: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(order_items)
    .innerJoin(orders, eq(orders.id, order_items.order_id))
    .where(and(eq(orders.user_id, user_id), eq(orders.payment_status, "paid")))
    .groupBy(order_items.product_id)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);

  return rows.map((r) => ({
    product_id: r.product_id,
    score: r.cnt,
    signals: { past_purchase: r.cnt },
  }));
}
