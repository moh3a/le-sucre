import type { analytics_events } from "../schema";

export type AnalyticsEventRow = typeof analytics_events.$inferInsert;

/**
 * Analytics provider abstraction.
 * The default implementation persists events to MySQL.
 * Future implementations can forward to Kafka, Segment, BigQuery, etc.
 */
export interface AnalyticsProvider {
  /** Provider identifier (used in logs / registry). */
  readonly name: string;

  /**
   * Durably persist a raw event row.
   * Called for every tracked event.
   */
  persist_event(row: AnalyticsEventRow): Promise<void>;

  /**
   * Forward real-time signals to an external stream (optional no-op).
   * Payload is intentionally loose so any downstream schema can be used.
   */
  forward_realtime(payload: Record<string, unknown>): Promise<void>;
}
