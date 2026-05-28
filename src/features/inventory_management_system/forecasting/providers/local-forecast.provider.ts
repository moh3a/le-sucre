import type {
  ForecastProvider,
  ForecastInput,
  ForecastOutput,
} from "./forecast-provider.interface";
import { predict_demand_local } from "../engines/low-stock-prediction.engine";

export const local_forecast_provider: ForecastProvider = {
  name: "local",
  async predict(input: ForecastInput): Promise<ForecastOutput> {
    return predict_demand_local({
      available: input.available,
      velocity_series: input.velocity_series.map((d) => ({
        day_key: d.day_key,
        units: d.units,
      })),
      lead_time_days: input.lead_time_days,
      safety_stock: input.safety_stock,
    });
  },
};
