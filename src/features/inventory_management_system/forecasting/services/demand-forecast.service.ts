import "server-only";
import { get_forecast_provider } from "../providers/provider-registry";
import { velocity_repository } from "../repositories/velocity.repository";
import { forecast_repository } from "../repositories/forecast.repository";
import { forecast_cache_service } from "./forecast-cache.service";
import { FORECAST_CACHE } from "../constants/cache-keys";
import { inventory_repository } from "../../inventory/repositories/inventory.repository";
import { inventory_forecast_snapshots } from "../schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { format } from "date-fns";
import { FORECAST_ERROR } from "../constants/error-codes";
import { throw_error } from "../../shared/error-codes";

export class DemandForecastService {
  async get_sku_forecast(sku_id: string, warehouse_id = "default") {
    const cache_key = FORECAST_CACHE.sku(sku_id, warehouse_id);
    const cached = (await forecast_cache_service.get(
      cache_key,
    )) as typeof inventory_forecast_snapshots.$inferSelect;
    if (cached) return cached;

    const snapshot = await forecast_repository.get_snapshot(sku_id, warehouse_id);
    if (snapshot) {
      await forecast_cache_service.set(cache_key, snapshot, 900);
      return snapshot;
    }
    return await this.recompute_sku(sku_id, warehouse_id);
  }

  async recompute_sku(sku_id: string, warehouse_id = "default") {
    const provider = get_forecast_provider();
    if (!provider) throw_error(FORECAST_ERROR.PROVIDER_UNAVAILABLE, { sku_id, warehouse_id });

    const level = await inventory_repository.ensure_level(sku_id, warehouse_id);
    const available = Math.max(0, level.quantity_on_hand - level.quantity_reserved);
    const series = await velocity_repository.list_series(sku_id, warehouse_id, 90);
    const rules = await forecast_repository.resolve_rules_for_sku(sku_id);

    const output = await provider.predict({
      sku_id,
      warehouse_id,
      available,
      velocity_series: series,
      lead_time_days: rules.lead_time_days,
      safety_stock: rules.safety_stock,
    });

    const saved = await forecast_repository.upsert_snapshot({
      sku_id,
      warehouse_id,
      ...output,
      safety_stock: rules.safety_stock,
      lead_time_days: rules.lead_time_days,
      computed_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });

    await forecast_cache_service.set(FORECAST_CACHE.sku(sku_id, warehouse_id), saved, 900);
    void audit_service.log({
      action: "forecasting.demand-forecast.recompute_sku",
      resource_type: "sku_id",
      resource_id: sku_id,
    });
    return saved;
  }
}
export const demand_forecast_service = new DemandForecastService();
