import "server-only";
import { env } from "@/config/env";
import type { AnalyticsProvider } from "./analytics-provider.interface";
import { local_analytics_provider } from "./local-analytics.provider";

const providers: Record<string, AnalyticsProvider> = {
  local: local_analytics_provider,
};

export function get_analytics_provider(): AnalyticsProvider {
  return providers[env.ANALYTICS_PROVIDER ?? "local"] ?? local_analytics_provider;
}
