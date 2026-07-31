import "server-only";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";
import { ANALYTICS_EVENT } from "../constants/event-types";
import { format } from "date-fns";

export function day_key(d = new Date()) {
  return format(d, "yyyy-MM-dd");
}

export async function increment_realtime_counter(
  event_type: string,
  fields: Record<string, string | number | undefined | null>,
) {
  const day = day_key();
  const pipe = redis.pipeline();

  pipe.hincrby(redisKeys.analyticsEvents.counter(event_type, day), "count", 1);

  if (fields.product_id) {
    pipe.hincrby(redisKeys.analyticsEvents.product(String(fields.product_id), day), event_type, 1);
    if (event_type === ANALYTICS_EVENT.product_view) {
      pipe.incr(redisKeys.analytics.productViews(String(fields.product_id)));
    }
  }

  if (fields.session_key) {
    pipe.pfadd(`analytics:uv:${day}`, String(fields.session_key));
  }

  if (event_type === ANALYTICS_EVENT.checkout_started) {
    pipe.hincrby(redisKeys.analyticsEvents.funnel("checkout", day), "sessions", 1);
  }
  if (event_type === ANALYTICS_EVENT.add_to_cart) {
    pipe.hincrby(redisKeys.analyticsEvents.funnel("add_to_cart", day), "sessions", 1);
  }
  if (event_type === ANALYTICS_EVENT.product_view) {
    pipe.hincrby(redisKeys.analyticsEvents.funnel("view", day), "sessions", 1);
  }

  pipe.lpush(
    redisKeys.analyticsEvents.buffer(),
    JSON.stringify({ event_type, day, fields, ts: Date.now() }),
  );
  pipe.ltrim(redisKeys.analyticsEvents.buffer(), 0, 49_999);

  pipe.hincrby("analytics:realtime:events", event_type, 1);
  await pipe.exec();
}
