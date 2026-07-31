import "server-only";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { inventory_alerts } from "../schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
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

  async list(input: { status?: string; page: number; limit: number }) {
    const offset = (input.page - 1) * input.limit;
    const where = input.status ? eq(inventory_alerts.status, input.status) : undefined;

    const [[{ total }], items] = await Promise.all([
      db.select({ total: count() }).from(inventory_alerts).where(where),
      db
        .select({
          id: inventory_alerts.id,
          sku_id: inventory_alerts.sku_id,
          warehouse_id: inventory_alerts.warehouse_id,
          alert_type: inventory_alerts.alert_type,
          severity: inventory_alerts.severity,
          message: inventory_alerts.message,
          status: inventory_alerts.status,
          created_at: inventory_alerts.created_at,
          resolved_at: inventory_alerts.resolved_at,
          product_name: product_translations.name,
        })
        .from(inventory_alerts)
        .leftJoin(product_skus, eq(inventory_alerts.sku_id, product_skus.id))
        .leftJoin(
          product_translations,
          eq(product_skus.product_id, product_translations.product_id),
        )
        .where(where)
        .orderBy(desc(inventory_alerts.created_at))
        .limit(input.limit)
        .offset(offset),
    ]);

    return {
      items,
      meta: { total, page: input.page, limit: input.limit, totalPages: Math.ceil(total / input.limit) },
    };
  }

  async stats() {
    const [total, open, ack, resolved, critical, warning] = await Promise.all([
      db.select({ count: count() }).from(inventory_alerts),
      db.select({ count: count() }).from(inventory_alerts).where(eq(inventory_alerts.status, "open")),
      db.select({ count: count() }).from(inventory_alerts).where(eq(inventory_alerts.status, "ack")),
      db.select({ count: count() }).from(inventory_alerts).where(eq(inventory_alerts.status, "resolved")),
      db.select({ count: count() }).from(inventory_alerts).where(eq(inventory_alerts.severity, "critical")),
      db.select({ count: count() }).from(inventory_alerts).where(eq(inventory_alerts.severity, "warning")),
    ]);

    return {
      total: total[0].count,
      open: open[0].count,
      ack: ack[0].count,
      resolved: resolved[0].count,
      critical: critical[0].count,
      warning: warning[0].count,
    };
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
