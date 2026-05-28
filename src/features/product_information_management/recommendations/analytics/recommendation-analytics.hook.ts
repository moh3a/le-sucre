import "server-only";
import { redis } from "@/lib/redis";
import { generate_id } from "@/lib/utils";
import { db } from "@/lib/db";
import { recommendationAnalyticsEvents } from "../schema";

export async function track_recommendation_event(input: {
  event_type: "impression" | "click";
  slot_type: string;
  source_product_id?: string;
  target_product_id: string;
  user_id?: string | null;
  session_key?: string | null;
}) {
  await redis.hincrby(`rec:analytics:${input.slot_type}`, input.event_type, 1);

  // async persist (fire-and-forget)
  void db.insert(recommendationAnalyticsEvents).values({
    id: generate_id(),
    ...input,
  });
}
