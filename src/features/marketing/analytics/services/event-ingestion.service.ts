import "server-only";
import { increment_realtime_counter } from "../engines/event-tracking.engine";
import { event_repository } from "../repositories/event.repository";
import { get_analytics_provider } from "../providers/provider-registry";

/** Input accepted by the ingestion service. `event_type` is intentionally
 * loose so server-side events (purchase, cart_abandoned) can be tracked;
 * the public surface is validated by the router DTOs. */
export type AnalyticsTrackInput = {
  event_type: string;
  session_key?: string | null;
  product_id?: string | null;
  sku_id?: string | null;
  category_id?: string | null;
  brand_id?: string | null;
  order_id?: string | null;
  cart_id?: string | null;
  search_query?: string | null;
  campaign_id?: string | null;
  slot_type?: string | null;
  revenue?: string | null;
  quantity?: number | null;
  metadata?: Record<string, unknown>;
};

export class EventIngestionService {
  async track(input: AnalyticsTrackInput & { user_id?: string | null }) {
    const provider = get_analytics_provider();

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
      order_id: input.order_id ?? null,
      cart_id: input.cart_id ?? null,
      search_query: input.search_query ?? null,
      campaign_id: input.campaign_id ?? null,
      slot_type: input.slot_type ?? null,
      revenue: input.revenue ?? null,
      quantity: input.quantity ?? null,
      metadata: input.metadata,
    });

    // async persist — provider can forward to Kafka/Segment later
    void provider.persist_event(row);
    void provider.forward_realtime({
      event_type: input.event_type,
      product_id: input.product_id ?? null,
      sku_id: input.sku_id ?? null,
      session_key: input.session_key ?? null,
      user_id: input.user_id ?? null,
      day_key: row.day_key,
      ts: Date.now(),
    });

    return { ok: true };
  }

  async track_batch(
    events: Array<
      AnalyticsTrackInput & {
        user_id?: string | null;
      }
    >,
    user_id?: string | null,
  ) {
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
    void get_analytics_provider().persist_events(rows);
  }
}

export const event_ingestion_service = new EventIngestionService();
