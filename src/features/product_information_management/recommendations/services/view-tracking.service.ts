import "server-only";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { customer_product_views } from "../schema";
import { increment_trending_signal } from "../engines/trending.engine";
import { RECOMMENDATION_CACHE } from "../constants/cache-keys";
import { tryFn } from "@/lib/error_handling";

const MAX_RECENT = 24;

export class ViewTrackingService {
  private recent_key(user_id?: string | null, session_key?: string | null) {
    return RECOMMENDATION_CACHE.recent(user_id ? `u:${user_id}` : `s:${session_key}`);
  }

  async track_view(input: {
    product_id: string;
    user_id?: string | null;
    session_key?: string | null;
  }) {
    const key = this.recent_key(input.user_id, input.session_key);
    const now = Date.now();

    const [redis_err] = await tryFn(
      Promise.all([
        redis.zadd(key, now, input.product_id),
        redis.zremrangebyrank(key, 0, -(MAX_RECENT + 1)),
        redis.expire(key, 60 * 60 * 24 * 14),
      ]),
    );
    void redis_err;

    void increment_trending_signal(input.product_id, "view");

    if (input.user_id || input.session_key) {
      const [db_err] = await tryFn(
        db.insert(customer_product_views).values({
          id: generate_id(),
          user_id: input.user_id ?? null,
          session_key: input.session_key ?? null,
          product_id: input.product_id,
        }),
      );
      void db_err;
    }
  }

  async list_recent(input: {
    user_id?: string | null;
    session_key?: string | null;
    limit?: number;
  }) {
    const key = this.recent_key(input.user_id, input.session_key);
    const [err, ids] = await tryFn(redis.zrevrange(key, 0, (input.limit ?? 12) - 1));
    if (err) return [];
    return ids ?? [];
  }
}
export const view_tracking_service = new ViewTrackingService();
