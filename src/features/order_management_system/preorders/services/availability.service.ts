// services/availability.service.ts
import "server-only";
import { preorder_repository } from "../repositories/preorder.repository";
import { inventory_repository } from "@/features/inventory_management_system/inventory/repositories/inventory.repository";
import { demand_forecast_service } from "@/features/inventory_management_system/forecasting/services/demand-forecast.service";

export class AvailabilityService {
  async resolve(sku_id: string, quantity: number, warehouse_id = "default") {
    const level = await inventory_repository.ensure_level(sku_id, warehouse_id);
    const available = Math.max(0, level.quantity_on_hand - level.quantity_reserved);
    const settings = await preorder_repository.get_settings(sku_id);

    if (available >= quantity) {
      return {
        mode: "in_stock" as const,
        available,
        fulfillment_type: "standard",
        estimated_available_at: null,
        deposit_percent: 100,
      };
    }

    if (settings?.is_preorder_enabled) {
      const remaining_cap =
        settings.max_preorder_qty == null
          ? Infinity
          : settings.max_preorder_qty - settings.preorder_sold;
      if (quantity <= remaining_cap) {
        const eta =
          settings.estimated_available_at ??
          (await this.estimate_from_forecast(sku_id, warehouse_id));
        return {
          mode: "preorder" as const,
          available,
          fulfillment_type: "preorder",
          estimated_available_at: eta,
          deposit_percent: Number(settings.deposit_percent ?? 100),
        };
      }
    }

    if (settings?.allow_backorder) {
      return {
        mode: "backorder" as const,
        available,
        fulfillment_type: "backorder",
        estimated_available_at: await this.estimate_from_forecast(sku_id, warehouse_id),
        deposit_percent: 100,
      };
    }

    return { mode: "unavailable" as const, available, fulfillment_type: null };
  }

  private async estimate_from_forecast(sku_id: string, warehouse_id: string) {
    const f = await demand_forecast_service.get_sku_forecast(sku_id, warehouse_id);
    if (f.days_until_stockout == null) return null;
    const d = new Date();
    d.setDate(d.getDate() + Math.ceil(Number(f.days_until_stockout)));
    return d.toISOString();
  }
}
export const availability_service = new AvailabilityService();
