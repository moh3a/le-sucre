import "server-only";

import { redis } from "@/lib/redis";

type RecommendationSignal = {
  customer_id: string;
  product_id: string;
  signal_type: "wishlist_add" | "wishlist_remove" | "favorite" | "collection_add" | "purchased";
  weight: number;
  timestamp: string;
};

export class WishlistRecommendationService {
  private readonly SIGNAL_TTL = 60 * 60 * 24 * 90; // 90 days

  async emit_signal(signal: Omit<RecommendationSignal, "timestamp">) {
    const key = `rec:signal:${signal.customer_id}:${signal.product_id}`;
    const data: RecommendationSignal = {
      ...signal,
      timestamp: new Date().toISOString(),
    };

    await redis.set(key, JSON.stringify(data), "EX", this.SIGNAL_TTL);
    await redis.zadd(
      `rec:signals:product:${signal.product_id}`,
      Date.now(),
      JSON.stringify({ customer_id: signal.customer_id, type: signal.signal_type, weight: signal.weight }),
    );
    await redis.zadd(
      `rec:signals:customer:${signal.customer_id}`,
      Date.now(),
      JSON.stringify({ product_id: signal.product_id, type: signal.signal_type, weight: signal.weight }),
    );

    // Update trending score
    const trending_key = `rec:trending:wishlist`;
    await redis.zincrby(trending_key, signal.weight, signal.product_id);
    await redis.expire(trending_key, 60 * 60 * 48); // 48 hours
  }

  async get_trending_wishlist_products(limit = 20) {
    const trending_key = `rec:trending:wishlist`;
    const results = await redis.zrevrange(trending_key, 0, limit - 1, "WITHSCORES");
    const products: Array<{ product_id: string; score: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      products.push({ product_id: results[i] as string, score: Number(results[i + 1]) });
    }
    return products;
  }

  async get_customer_signals(customer_id: string, limit = 50) {
    const key = `rec:signals:customer:${customer_id}`;
    const results = await redis.zrevrange(key, 0, limit - 1);
    return results.map((r) => JSON.parse(r) as Omit<RecommendationSignal, "timestamp">);
  }

  async get_product_signals(product_id: string, limit = 50) {
    const key = `rec:signals:product:${product_id}`;
    const results = await redis.zrevrange(key, 0, limit - 1);
    return results.map((r) => JSON.parse(r) as Omit<RecommendationSignal, "timestamp">);
  }

  async get_similar_customers(customer_id: string, limit = 10): Promise<string[]> {
    const customer_signals = await this.get_customer_signals(customer_id);
    const product_ids = [...new Set(customer_signals.map((s) => s.product_id))];

    if (product_ids.length === 0) return [];

    // Find other customers who wished/favorited the same products
    const similar_scores = new Map<string, number>();
    for (const pid of product_ids) {
      const signals = await this.get_product_signals(pid);
      for (const signal of signals) {
        if (signal.customer_id !== customer_id) {
          similar_scores.set(
            signal.customer_id,
            (similar_scores.get(signal.customer_id) ?? 0) + signal.weight,
          );
        }
      }
    }

    return [...similar_scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cid]) => cid);
  }

  async export_wishlist_signals(customer_id: string): Promise<RecommendationSignal[]> {
    const key = `rec:signals:customer:${customer_id}`;
    const results = await redis.zrevrange(key, 0, -1);
    return results.map((r) => JSON.parse(r) as RecommendationSignal);
  }

  async clear_customer_signals(customer_id: string): Promise<void> {
    const pattern = `rec:signal:${customer_id}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
    await redis.del(`rec:signals:customer:${customer_id}`);
  }
}

export const wishlist_recommendation_service = new WishlistRecommendationService();
