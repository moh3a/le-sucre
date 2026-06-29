import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc, desc, sql, gte } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { fraud_reviews } from "../schema";
import { orders } from "@/features/order_management_system/orders/schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export interface FraudFlag {
  rule: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

export class FraudReviewService {
  async screen_order(order_id: string): Promise<typeof fraud_reviews.$inferSelect | null> {
    const [existing] = await db
      .select()
      .from(fraud_reviews)
      .where(eq(fraud_reviews.order_id, order_id))
      .limit(1);

    if (existing) return existing;

    const [order] = await db.select().from(orders).where(eq(orders.id, order_id)).limit(1);
    if (!order) return null;

    const grand_total = Number(order.grand_total);
    const shipping_total = Number(order.shipping_total);
    const shipping_address = order.shipping_address as Record<string, unknown> | null;
    const payment_method = (order.metadata as Record<string, unknown> | null)?.payment_method as string ?? order.payment_provider ?? "";

    const flags: FraudFlag[] = [];
    let risk_score = 0;

    const high_value_threshold = 100000;
    if (grand_total >= high_value_threshold) {
      flags.push({ rule: "high_value", reason: `Order total ${grand_total} exceeds threshold`, severity: "high" });
      risk_score += 40;
    }

    if (shipping_address && String(shipping_address.line1 ?? "").includes("PO Box")) {
      flags.push({ rule: "po_box_address", reason: "Shipping to PO Box", severity: "medium" });
      risk_score += 20;
    }

    const recent_orders_count = await this._count_recent_orders(order.user_id);
    if (recent_orders_count === 0) {
      flags.push({ rule: "new_customer", reason: "First time customer", severity: "low" });
      risk_score += 5;
    }

    if (recent_orders_count > 5) {
      flags.push({ rule: "multiple_orders", reason: `${recent_orders_count} orders in last 24h`, severity: "medium" });
      risk_score += 25;
    }

    if (grand_total > 0 && shipping_total > grand_total * 0.5) {
      flags.push({ rule: "high_shipping_ratio", reason: "Shipping cost > 50% of order total", severity: "low" });
      risk_score += 10;
    }

    if (order.notes?.toLowerCase().includes("urgent") || order.notes?.toLowerCase().includes("express")) {
      flags.push({ rule: "urgency_flag", reason: "Order marked as urgent/express", severity: "low" });
      risk_score += 5;
    }

    if (payment_method === "cod" && grand_total >= 50000) {
      flags.push({ rule: "high_value_cod", reason: "High value COD order", severity: "high" });
      risk_score += 35;
    }

    const status = risk_score >= 50 ? "pending" : "cleared";
    const id = generate_id();

    await db.insert(fraud_reviews).values({
      id,
      order_id,
      risk_score,
      flags: flags as any,
      status,
    });

    if (status === "pending") {
      void audit_service.log({
        action: "fraud_review.flagged",
        resource_type: "order_id",
        resource_id: order_id,
        metadata: { risk_score, flag_count: flags.length },
      });
    }

    return this.get(id);
  }

  async review(input: {
    id: string;
    user_id: string;
    decision: "approved" | "rejected" | "review";
    decision_reason: string;
  }) {
    await db
      .update(fraud_reviews)
      .set({
        status: input.decision === "approved" ? "cleared" : input.decision === "rejected" ? "blocked" : "manual_review",
        reviewed_by_user_id: input.user_id,
        decision: input.decision,
        decision_reason: input.decision_reason,
        reviewed_at: sql`NOW()`,
      })
      .where(eq(fraud_reviews.id, input.id));

    void audit_service.log({
      action: `fraud_review.${input.decision}`,
      resource_type: "fraud_review_id",
      resource_id: input.id,
      metadata: { decision: input.decision },
    });

    return this.get(input.id);
  }

  async get(id: string) {
    const [row] = await db.select().from(fraud_reviews).where(eq(fraud_reviews.id, id)).limit(1);
    return row ?? null;
  }

  async list_pending() {
    return db
      .select()
      .from(fraud_reviews)
      .where(eq(fraud_reviews.status, "pending"))
      .orderBy(desc(fraud_reviews.risk_score));
  }

  async list_all(status?: string) {
    const clauses: any[] = [];
    if (status) clauses.push(eq(fraud_reviews.status, status));
    return db
      .select()
      .from(fraud_reviews)
      .where(clauses.length ? and(...clauses) : undefined)
      .orderBy(desc(fraud_reviews.risk_score));
  }

  async get_stats() {
    const [pending, cleared, blocked, manual] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(fraud_reviews).where(eq(fraud_reviews.status, "pending")),
      db.select({ count: sql<number>`count(*)` }).from(fraud_reviews).where(eq(fraud_reviews.status, "cleared")),
      db.select({ count: sql<number>`count(*)` }).from(fraud_reviews).where(eq(fraud_reviews.status, "blocked")),
      db.select({ count: sql<number>`count(*)` }).from(fraud_reviews).where(eq(fraud_reviews.status, "manual_review")),
    ]);

    return {
      pending: Number(pending[0]?.count ?? 0),
      cleared: Number(cleared[0]?.count ?? 0),
      blocked: Number(blocked[0]?.count ?? 0),
      manual_review: Number(manual[0]?.count ?? 0),
    };
  }

  async rescreen_all_pending(): Promise<number> {
    const pending = await db
      .select()
      .from(fraud_reviews)
      .where(eq(fraud_reviews.status, "pending"));

    let updated = 0;
    for (const item of pending) {
      const result = await this.screen_order(item.order_id);
      if (result && result.risk_score < 30) {
        await db
          .update(fraud_reviews)
          .set({ status: "cleared" })
          .where(eq(fraud_reviews.id, item.id));
        updated++;
      }
    }
    return updated;
  }

  private async _count_recent_orders(user_id: string | null): Promise<number> {
    if (!user_id) return 0;
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.user_id, user_id),
          gte(orders.created_at, sql`DATE_SUB(NOW(), INTERVAL 24 HOUR)`),
        ),
      );
    return rows[0]?.count ?? 0;
  }
}

export const fraud_review_service = new FraudReviewService();
