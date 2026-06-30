import "server-only";
import { and, eq, lte } from "drizzle-orm";
import { format, subHours } from "date-fns";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { carts } from "@/features/order_management_system/carts/schema";
import { event_ingestion_service } from "./event-ingestion.service";

const CART_ABANDONED_HOURS = 1;
const CART_ABANDONED_BATCH = 100;

export class CartAbandonmentService {
  async track_abandoned() {
    const threshold = format(subHours(new Date(), CART_ABANDONED_HOURS), "yyyy-MM-dd HH:mm:ss");

    const abandoned_carts = await db
      .select({ id: carts.id, user_id: carts.user_id })
      .from(carts)
      .where(
        and(eq(carts.status, "active"), lte(carts.updated_at, threshold)),
      )
      .limit(CART_ABANDONED_BATCH);

    if (!abandoned_carts.length) return;

    const reported = await redis.smembers("analytics:abandoned_reported");
    const reported_set = new Set(reported);

    for (const cart of abandoned_carts) {
      if (reported_set.has(cart.id)) continue;
      void event_ingestion_service.track({
        event_type: "cart_abandoned",
        cart_id: cart.id,
        user_id: cart.user_id,
      });
    }

    const new_ids = abandoned_carts
      .filter((c) => !reported_set.has(c.id))
      .map((c) => c.id);
    if (new_ids.length) await redis.sadd("analytics:abandoned_reported", ...new_ids);
  }
}

export const cart_abandonment_service = new CartAbandonmentService();
