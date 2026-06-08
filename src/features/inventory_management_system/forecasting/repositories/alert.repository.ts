import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventory_alerts } from "../schema";
import { forecast_repository } from "./forecast.repository";
import { format } from "date-fns";

export class AlertRepository {
  resolve_rules(sku_id: string) {
    return forecast_repository.resolve_rules_for_sku(sku_id);
  }

  async create_open_if_missing(input: {
    id: string;
    sku_id: string;
    warehouse_id: string;
    alert_type: string;
    severity: string;
    message: string;
    payload: Record<string, unknown>;
  }) {
    const [existing] = await db
      .select()
      .from(inventory_alerts)
      .where(
        and(
          eq(inventory_alerts.sku_id, input.sku_id),
          eq(inventory_alerts.warehouse_id, input.warehouse_id),
          eq(inventory_alerts.alert_type, input.alert_type),
          eq(inventory_alerts.status, "open"),
        ),
      )
      .limit(1);

    if (existing) return existing;

    await db.insert(inventory_alerts).values({
      id: input.id,
      sku_id: input.sku_id,
      warehouse_id: input.warehouse_id,
      alert_type: input.alert_type,
      severity: input.severity,
      message: input.message,
      payload: input.payload,
      status: "open",
    });

    const [created] = await db
      .select()
      .from(inventory_alerts)
      .where(eq(inventory_alerts.id, input.id))
      .limit(1);

    return created ?? null;
  }

  mark_notified(id: string) {
    return db
      .update(inventory_alerts)
      .set({ notified_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") })
      .where(eq(inventory_alerts.id, id));
  }

  list(input: { status?: string; page: number; limit: number }) {
    const offset = (input.page - 1) * input.limit;
    const where = input.status ? eq(inventory_alerts.status, input.status) : undefined;
    return db
      .select()
      .from(inventory_alerts)
      .where(where)
      .orderBy(desc(inventory_alerts.created_at))
      .limit(input.limit)
      .offset(offset);
  }

  ack(id: string) {
    return db.update(inventory_alerts).set({ status: "ack" }).where(eq(inventory_alerts.id, id));
  }

  resolve(id: string) {
    return db
      .update(inventory_alerts)
      .set({ status: "resolved", resolved_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") })
      .where(eq(inventory_alerts.id, id));
  }
}
export const alert_repository = new AlertRepository();
