import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc, sql } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { order_routing_rules } from "../schema";
import { orders } from "@/features/order_management_system/orders/schema";
import { order_assignments } from "@/features/order_management_system/orders/operations/schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class OrderRoutingService {
  async create_rule(input: {
    name: string;
    priority: number;
    conditions: Array<{ field: string; operator: string; value: string }>;
    assign_to_user_id?: string;
    assign_to_role?: string;
  }) {
    const id = generate_id();
    await db.insert(order_routing_rules).values({ id, ...input, is_active: true });
    return this.get_rule(id);
  }

  async get_rule(id: string) {
    const [row] = await db.select().from(order_routing_rules).where(eq(order_routing_rules.id, id)).limit(1);
    return row ?? null;
  }

  async list_rules() {
    return db
      .select()
      .from(order_routing_rules)
      .orderBy(asc(order_routing_rules.priority));
  }

  async toggle_rule(id: string, is_active: boolean) {
    await db.update(order_routing_rules).set({ is_active }).where(eq(order_routing_rules.id, id));
    return this.get_rule(id);
  }

  async delete_rule(id: string) {
    await db.delete(order_routing_rules).where(eq(order_routing_rules.id, id));
  }

  async assign_order(order_id: string): Promise<{ assigned_to_user_id: string | null; rule_id: string | null }> {
    const [order] = await db.select().from(orders).where(eq(orders.id, order_id)).limit(1);
    if (!order) throw new Error("Order not found");

    const rules = await db
      .select()
      .from(order_routing_rules)
      .where(eq(order_routing_rules.is_active, true))
      .orderBy(asc(order_routing_rules.priority));

    for (const rule of rules) {
      const conditions = rule.conditions as Array<{ field: string; operator: string; value: string }>;
      const matches = this._evaluate_conditions(order, conditions);

      if (!matches) continue;

      let assign_to: string | null = rule.assign_to_user_id ?? null;
      if (!assign_to && rule.assign_to_role) {
        assign_to = await this._find_user_by_role(rule.assign_to_role);
      }

      if (assign_to) {
        await this._record_assignment(order_id, assign_to, rule.id);

        void audit_service.log({
          action: "order.routed",
          resource_type: "order_id",
          resource_id: order_id,
          metadata: { rule_id: rule.id, assigned_to: assign_to },
        });
      }

      return { assigned_to_user_id: assign_to, rule_id: rule.id };
    }

    return { assigned_to_user_id: null, rule_id: null };
  }

  async assign_batch(limit = 20): Promise<number> {
    const unassigned = await db
      .select()
      .from(orders)
      .where(eq(orders.status, "pending"))
      .limit(limit);

    let assigned_count = 0;
    for (const order of unassigned) {
      const result = await this.assign_order(order.id);
      if (result.assigned_to_user_id) assigned_count++;
    }
    return assigned_count;
  }

  private _evaluate_conditions(order: typeof orders.$inferSelect, conditions: Array<{ field: string; operator: string; value: string }>): boolean {
    for (const cond of conditions) {
      const order_val = this._get_field_value(order, cond.field);
      const matches = this._apply_operator(order_val, cond.operator, cond.value);
      if (!matches) return false;
    }
    return true;
  }

  private _get_field_value(order: Record<string, unknown>, field: string): string {
    const val = order[field];
    if (val === null || val === undefined) return "";
    return String(val);
  }

  private _apply_operator(order_value: string, operator: string, condition_value: string): boolean {
    switch (operator) {
      case "equals": return order_value === condition_value;
      case "not_equals": return order_value !== condition_value;
      case "contains": return order_value.includes(condition_value);
      case "greater_than": return Number(order_value) > Number(condition_value);
      case "less_than": return Number(order_value) < Number(condition_value);
      case "in": return condition_value.split(",").map((s) => s.trim()).includes(order_value);
      case "not_in": return !condition_value.split(",").map((s) => s.trim()).includes(order_value);
      default: return false;
    }
  }

  private async _find_user_by_role(role: string): Promise<string | null> {
    const rows = await db
      .select({ id: sql<string>`user_id` })
      .from(sql`user_roles`)
      .where(eq(sql`role`, role))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  private async _record_assignment(order_id: string, user_id: string, rule_id: string) {
    await db.insert(order_assignments).values({
      id: generate_id(),
      order_id,
      assignment_type: "auto_route",
      to_user_id: user_id,
      assigned_by_user_id: "__system__",
      note: `Auto-assigned by routing rule ${rule_id}`,
    });
  }
}

export const order_routing_service = new OrderRoutingService();
