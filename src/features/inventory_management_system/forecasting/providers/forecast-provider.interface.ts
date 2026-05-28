export type ForecastInput = {
  sku_id: string;
  warehouse_id: string;
  available: number;
  velocity_series: Array<{ day_key: string; units: number }>;
  lead_time_days: number;
  safety_stock: number;
};

export type ForecastOutput = {
  avg_daily_sales: number;
  trend_slope: number;
  days_until_stockout: number | null;
  predicted_demand_30d: number;
  recommended_reorder_qty: number;
  confidence: number;
  risk_level: "low" | "normal" | "high" | "critical";
  signals: Record<string, number>;
};

export interface ForecastProvider {
  readonly name: string;
  predict(input: ForecastInput): Promise<ForecastOutput>;
}
