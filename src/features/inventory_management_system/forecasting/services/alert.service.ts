import "server-only";
import { generate_id } from "@/lib/utils";
import { alert_repository } from "../repositories/alert.repository";
import { trigger_inventory_notification } from "../notifications/inventory-notification.trigger";
import { demand_forecast_service } from "./demand-forecast.service";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class AlertService {
  async evaluate_sku(sku_id: string, warehouse_id = "default") {
    const forecast = await demand_forecast_service.get_sku_forecast(sku_id, warehouse_id);
    const rules = await alert_repository.resolve_rules(sku_id);
    const available = Number(forecast.signals?.available ?? 0);

    const alerts = [];

    if (available <= rules.critical_stock_threshold) {
      alerts.push({
        alert_type: "low_stock",
        severity: "critical",
        message: `Stock critique (${available} restants)`,
      });
    } else if (available <= rules.low_stock_threshold) {
      alerts.push({
        alert_type: "low_stock",
        severity: "warning",
        message: `Stock bas (${available} restants)`,
      });
    }

    if (
      forecast.days_until_stockout != null &&
      Number(forecast.days_until_stockout) <= rules.days_until_stockout_warning
    ) {
      alerts.push({
        alert_type: "stockout_predicted",
        severity: "warning",
        message: `Rupture estimée dans ${forecast.days_until_stockout} jours`,
      });
    }

    if (forecast.recommended_reorder_qty > 0) {
      alerts.push({
        alert_type: "reorder",
        severity: "info",
        message: `Réappro recommandé: ${forecast.recommended_reorder_qty} unités`,
      });
    }

    for (const a of alerts) {
      const created = await alert_repository.create_open_if_missing({
        id: generate_id(),
        sku_id,
        warehouse_id,
        ...a,
        payload: { forecast },
      });
      if (created && !created.notified_at) {
        await trigger_inventory_notification(created);
        await alert_repository.mark_notified(created.id);
      }
    }

    void audit_service.log({
      action: "forecasting.evaluate-sku",
      resource_type: "sku_id",
      resource_id: sku_id,
    });
  }
}
export const alert_service = new AlertService();
