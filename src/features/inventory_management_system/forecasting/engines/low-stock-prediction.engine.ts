import type { ForecastOutput } from "../providers/forecast-provider.interface";
import { compute_ema_velocity, linear_trend_slope } from "./sales-trend.engine";

export function predict_demand_local(input: {
  available: number;
  velocity_series: Array<{ day_key: string; units: number }>;
  lead_time_days: number;
  safety_stock: number;
}): ForecastOutput {
  const units = input.velocity_series.map((d) => d.units);
  const avg = compute_ema_velocity(units);
  const slope = linear_trend_slope(units.slice(-14));
  const projected_daily = Math.max(0, avg + slope);

  const days_until_stockout =
    projected_daily > 0 ? Number((input.available / projected_daily).toFixed(2)) : null;

  const predicted_demand_30d = Math.ceil(projected_daily * 30);
  const reorder_point = Math.ceil(projected_daily * input.lead_time_days + input.safety_stock);
  const recommended_reorder_qty = Math.max(0, reorder_point - input.available);

  let risk_level: ForecastOutput["risk_level"] = "normal";
  if (input.available <= 0) risk_level = "critical";
  else if (days_until_stockout != null && days_until_stockout <= 7) risk_level = "high";
  else if (days_until_stockout != null && days_until_stockout <= 14) risk_level = "normal";
  else risk_level = "low";

  const confidence = Math.min(0.95, 0.35 + Math.min(units.length, 60) / 60);

  return {
    avg_daily_sales: Number(avg.toFixed(4)),
    trend_slope: Number(slope.toFixed(6)),
    days_until_stockout,
    predicted_demand_30d,
    recommended_reorder_qty,
    confidence,
    risk_level,
    signals: { ema: avg, slope, projected_daily, available: input.available },
  };
}
