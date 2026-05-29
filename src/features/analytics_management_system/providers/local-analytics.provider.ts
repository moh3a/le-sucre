import "server-only";
import type { AnalyticsProvider } from "./analytics-provider.interface";
import { event_repository } from "../repositories/event.repository";

export const local_analytics_provider: AnalyticsProvider = {
  name: "local",
  async persist_event(row) {
    await event_repository.insert_batch([row]);
  },
  async forward_realtime(_payload) {
    // no-op — future: Kafka / Segment / BigQuery streaming
  },
};
