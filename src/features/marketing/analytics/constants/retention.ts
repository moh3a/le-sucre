import { env } from "@/config/env";

export const ANALYTICS_RETENTION = {
  raw_events_days: env.ANALYTICS_RAW_RETENTION_DAYS,
  aggregate_days: env.ANALYTICS_AGGREGATE_RETENTION_DAYS,
} as const;
