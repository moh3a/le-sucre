import "server-only";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import {
  inventory_forecast_snapshots,
  inventory_alert_rules,
  inventory_forecast_jobs,
} from "../schema";
import type { ForecastOutput } from "../providers/forecast-provider.interface";

const DEFAULT_RULES = {
  lead_time_days: 7,
  safety_stock: 3,
  low_stock_threshold: 5,
  critical_stock_threshold: 1,
  days_until_stockout_warning: 14,
};

export class ForecastRepository {
  get_snapshot(sku_id: string, warehouse_id: string) {
    return db
      .select()
      .from(inventory_forecast_snapshots)
      .where(
        and(
          eq(inventory_forecast_snapshots.sku_id, sku_id),
          eq(inventory_forecast_snapshots.warehouse_id, warehouse_id),
        ),
      )
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async resolve_rules_for_sku(sku_id: string) {
    const [sku_rule] = await db
      .select()
      .from(inventory_alert_rules)
      .where(
        and(
          eq(inventory_alert_rules.scope_type, "sku"),
          eq(inventory_alert_rules.scope_id, sku_id),
          eq(inventory_alert_rules.is_active, true),
        ),
      )
      .limit(1);

    const [global_rule] = await db
      .select()
      .from(inventory_alert_rules)
      .where(
        and(
          eq(inventory_alert_rules.scope_type, "global"),
          eq(inventory_alert_rules.is_active, true),
        ),
      )
      .limit(1);

    const rule = sku_rule ?? global_rule;
    return {
      lead_time_days: DEFAULT_RULES.lead_time_days,
      safety_stock: DEFAULT_RULES.safety_stock,
      low_stock_threshold: rule?.low_stock_threshold ?? DEFAULT_RULES.low_stock_threshold,
      critical_stock_threshold:
        rule?.critical_stock_threshold ?? DEFAULT_RULES.critical_stock_threshold,
      days_until_stockout_warning:
        rule?.days_until_stockout_warning ?? DEFAULT_RULES.days_until_stockout_warning,
    };
  }

  async upsert_snapshot(
    input: {
      sku_id: string;
      warehouse_id: string;
      computed_at: string;
      safety_stock?: number;
      lead_time_days?: number;
    } & ForecastOutput,
  ) {
    const payload = {
      sku_id: input.sku_id,
      warehouse_id: input.warehouse_id,
      avg_daily_sales: String(input.avg_daily_sales),
      trend_slope: String(input.trend_slope),
      days_until_stockout:
        input.days_until_stockout != null ? String(input.days_until_stockout) : null,
      predicted_demand_30d: input.predicted_demand_30d,
      recommended_reorder_qty: input.recommended_reorder_qty,
      safety_stock: input.safety_stock ?? DEFAULT_RULES.safety_stock,
      lead_time_days: input.lead_time_days ?? DEFAULT_RULES.lead_time_days,
      confidence: String(input.confidence),
      risk_level: input.risk_level,
      signals: input.signals,
      computed_at: input.computed_at,
    };

    await db
      .insert(inventory_forecast_snapshots)
      .values({ id: generate_id(), ...payload })
      .onDuplicateKeyUpdate({
        set: {
          avg_daily_sales: payload.avg_daily_sales,
          trend_slope: payload.trend_slope,
          days_until_stockout: payload.days_until_stockout,
          predicted_demand_30d: payload.predicted_demand_30d,
          recommended_reorder_qty: payload.recommended_reorder_qty,
          safety_stock: payload.safety_stock,
          lead_time_days: payload.lead_time_days,
          confidence: payload.confidence,
          risk_level: payload.risk_level,
          signals: payload.signals,
          computed_at: payload.computed_at,
        },
      });

    return this.get_snapshot(input.sku_id, input.warehouse_id);
  }

  claim_pending(limit: number) {
    return db
      .select()
      .from(inventory_forecast_jobs)
      .where(
        and(
          eq(inventory_forecast_jobs.status, "pending"),
          lte(inventory_forecast_jobs.run_after, sql`NOW()`),
        ),
      )
      .orderBy(asc(inventory_forecast_jobs.run_after))
      .limit(limit);
  }

  mark_done(id: string) {
    return db
      .update(inventory_forecast_jobs)
      .set({ status: "done", updated_at: new Date().toISOString() })
      .where(eq(inventory_forecast_jobs.id, id));
  }

  mark_failed(id: string, error: unknown) {
    return db
      .update(inventory_forecast_jobs)
      .set({
        status: "failed",
        attempts: sql`${inventory_forecast_jobs.attempts} + 1`,
        last_error: error instanceof Error ? error.message : "unknown",
        updated_at: new Date().toISOString(),
      })
      .where(eq(inventory_forecast_jobs.id, id));
  }
}

export const forecast_repository = new ForecastRepository();
export const forecast_job_repository = forecast_repository;
