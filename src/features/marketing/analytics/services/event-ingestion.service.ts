import "server-only";
import type { z } from "zod";
import { increment_realtime_counter } from "../engines/event-tracking.engine";
import { event_repository } from "../repositories/event.repository";
import type { ingest_event_dto } from "../models/analytics.dto";
import { get_analytics_provider } from "../providers/provider-registry";

export class EventIngestionService {
  async track(
    input: z.infer<typeof ingest_event_dto> & {
      user_id?: string | null;
    },
  ) {
    await increment_realtime_counter(input.event_type, {
      product_id: input.product_id,
      sku_id: input.sku_id,
      session_key: input.session_key,
      category_id: input.category_id,
      brand_id: input.brand_id,
    });

    const row = event_repository.build_row({
      event_type: input.event_type,
      session_key: input.session_key ?? null,
      user_id: input.user_id ?? null,
      product_id: input.product_id ?? null,
      sku_id: input.sku_id ?? null,
      category_id: input.category_id ?? null,
      brand_id: input.brand_id ?? null,
      cart_id: input.cart_id ?? null,
      search_query: input.search_query ?? null,
      campaign_id: input.campaign_id ?? null,
      slot_type: input.slot_type ?? null,
      quantity: input.quantity ?? null,
      metadata: input.metadata,
    });

    // async persist — provider can forward to Kafka/Segment later
    void get_analytics_provider().persist_event(row);
    return { ok: true };
  }

  async track_batch(events: Array<z.infer<typeof ingest_event_dto>>, user_id?: string | null) {
    for (const e of events) await this.track({ ...e, user_id });
    return { ok: true, count: events.length };
  }

  /** Server-side business events */
  async track_purchase(input: {
    order_id: string;
    user_id?: string | null;
    revenue: string;
    lines: Array<{ product_id: string; sku_id: string; quantity: number; category_id?: string }>;
  }) {
    await increment_realtime_counter("purchase", { session_key: input.user_id });
    const rows = input.lines.map((line) =>
      event_repository.build_row({
        event_type: "purchase",
        user_id: input.user_id ?? null,
        order_id: input.order_id,
        product_id: line.product_id,
        sku_id: line.sku_id,
        category_id: line.category_id ?? null,
        quantity: line.quantity,
        revenue: input.revenue,
      }),
    );
    void event_repository.insert_batch(rows);
  }
}

export const event_ingestion_service = new EventIngestionService();
