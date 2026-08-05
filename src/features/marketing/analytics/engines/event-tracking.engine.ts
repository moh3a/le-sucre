import "server-only";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis/keys";
import { ANALYTICS_EVENT, FUNNEL_STEP } from "../constants/event-types";
import { ANALYTICS_RETENTION } from "../constants/retention";
import { format } from "date-fns";

export function day_key(d = new Date()) {
  return format(d, "yyyy-MM-dd");
}

const FUNNEL_STEP_FOR_EVENT: Record<string, string> = {
  [ANALYTICS_EVENT.product_view]: FUNNEL_STEP.view,
  [ANALYTICS_EVENT.add_to_cart]: FUNNEL_STEP.add_to_cart,
  [ANALYTICS_EVENT.checkout_started]: FUNNEL_STEP.checkout,
  [ANALYTICS_EVENT.purchase]: FUNNEL_STEP.purchase,
};

export async function increment_realtime_counter(
  event_type: string,
  fields: Record<string, string | number | undefined | null>,
) {
  const day = day_key();
  const pipe = redis.pipeline();

  if (fields.product_id && event_type === ANALYTICS_EVENT.product_view) {
    pipe.incr(redisKeys.analytics.productViews(String(fields.product_id)));
  }

  if (fields.session_key) {
    const uv_key = `analytics:uv:${day}`;
    pipe.pfadd(uv_key, String(fields.session_key));
    pipe.expire(uv_key, ANALYTICS_RETENTION.raw_events_days * 86400);
  }

  const step = FUNNEL_STEP_FOR_EVENT[event_type];
  if (step) {
    const funnel_key = redisKeys.analyticsEvents.funnel(step, day);
    pipe.hincrby(funnel_key, "sessions", 1);
    pipe.expire(funnel_key, ANALYTICS_RETENTION.raw_events_days * 86400);
  }

  const realtime_key = redisKeys.analyticsEvents.realtime();
  pipe.hincrby(realtime_key, event_type, 1);
  pipe.expire(realtime_key, 86_400);

  await pipe.exec();
}
