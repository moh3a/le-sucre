import "server-only";

import { env } from "@/config/env";
import type { ForecastProvider } from "./forecast-provider.interface";
import { local_forecast_provider } from "./local-forecast.provider";

const providers: Record<string, ForecastProvider> = {
  local: local_forecast_provider,
  // future: ml: ml_forecast_provider,
  // future: vertex: vertex_forecast_provider,
};

export function get_forecast_provider(): ForecastProvider {
  const key = env.FORECAST_PROVIDER ?? "local";
  return providers[key] ?? local_forecast_provider;
}
