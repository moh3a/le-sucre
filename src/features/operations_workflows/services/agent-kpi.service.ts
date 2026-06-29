import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc, desc, sql, gte } from "drizzle-orm";
import { agent_kpi_daily } from "../schema";
import { format, subDays } from "date-fns";
import { generate_id } from "@/lib/utils";

export class AgentKPIService {
  async record_metric(input: {
    user_id: string;
    role: string;
    metric: "orders_processed" | "orders_assigned" | "cases_resolved" | "tasks_completed" | "calls_made" | "sla_breaches";
    value?: number;
  }) {
    const day_key = format(new Date(), "yyyy-MM-dd");
    const existing = await db
      .select()
      .from(agent_kpi_daily)
      .where(
        and(
          eq(agent_kpi_daily.user_id, input.user_id),
          eq(agent_kpi_daily.day_key, day_key),
        ),
      )
      .limit(1);

    if (existing.length) {
      await db
        .update(agent_kpi_daily)
        .set({
          [input.metric]: sql`${agent_kpi_daily[input.metric]} + ${input.value ?? 1}`,
        })
        .where(eq(agent_kpi_daily.id, existing[0].id));
    } else {
      await db.insert(agent_kpi_daily).values({
        id: generate_id(),
        user_id: input.user_id,
        day_key,
        role: input.role,
        [input.metric]: input.value ?? 1,
      });
    }
  }

  async get_user_kpi(user_id: string, days = 30) {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");
    const rows = await db
      .select()
      .from(agent_kpi_daily)
      .where(
        and(
          eq(agent_kpi_daily.user_id, user_id),
          gte(agent_kpi_daily.day_key, since),
        ),
      )
      .orderBy(asc(agent_kpi_daily.day_key));

    const totals = rows.reduce(
      (acc, r) => ({
        orders_processed: acc.orders_processed + r.orders_processed,
        orders_assigned: acc.orders_assigned + r.orders_assigned,
        cases_resolved: acc.cases_resolved + r.cases_resolved,
        tasks_completed: acc.tasks_completed + r.tasks_completed,
        calls_made: acc.calls_made + r.calls_made,
        sla_breaches: acc.sla_breaches + r.sla_breaches,
      }),
      { orders_processed: 0, orders_assigned: 0, cases_resolved: 0, tasks_completed: 0, calls_made: 0, sla_breaches: 0 },
    );

    const avg_response = rows
      .filter((r) => r.avg_response_time_minutes)
      .reduce((s, r) => s + Number(r.avg_response_time_minutes), 0);
    const avg_response_count = rows.filter((r) => r.avg_response_time_minutes).length;

    return {
      daily: rows,
      totals,
      avg_response_time_minutes: avg_response_count > 0 ? avg_response / avg_response_count : 0,
      days_covered: rows.length,
    };
  }

  async get_role_leaderboard(role: string, days = 7) {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");

    const rows = await db
      .select({
        user_id: agent_kpi_daily.user_id,
        orders_processed: sql<number>`SUM(${agent_kpi_daily.orders_processed})`,
        cases_resolved: sql<number>`SUM(${agent_kpi_daily.cases_resolved})`,
        tasks_completed: sql<number>`SUM(${agent_kpi_daily.tasks_completed})`,
        sla_breaches: sql<number>`SUM(${agent_kpi_daily.sla_breaches})`,
      })
      .from(agent_kpi_daily)
      .where(
        and(
          eq(agent_kpi_daily.role, role),
          gte(agent_kpi_daily.day_key, since),
        ),
      )
      .groupBy(agent_kpi_daily.user_id)
      .orderBy(desc(sql`SUM(${agent_kpi_daily.orders_processed})`))
      .limit(20);

    return rows.map((r) => ({
      user_id: r.user_id,
      orders_processed: Number(r.orders_processed),
      cases_resolved: Number(r.cases_resolved),
      tasks_completed: Number(r.tasks_completed),
      sla_breaches: Number(r.sla_breaches),
    }));
  }

  async get_dashboard_stats(days = 7) {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");

    const [total_processed, total_cases, total_tasks, total_sla_breaches] = await Promise.all([
      db.select({ value: sql<number>`COALESCE(SUM(${agent_kpi_daily.orders_processed}), 0)` }).from(agent_kpi_daily).where(gte(agent_kpi_daily.day_key, since)),
      db.select({ value: sql<number>`COALESCE(SUM(${agent_kpi_daily.cases_resolved}), 0)` }).from(agent_kpi_daily).where(gte(agent_kpi_daily.day_key, since)),
      db.select({ value: sql<number>`COALESCE(SUM(${agent_kpi_daily.tasks_completed}), 0)` }).from(agent_kpi_daily).where(gte(agent_kpi_daily.day_key, since)),
      db.select({ value: sql<number>`COALESCE(SUM(${agent_kpi_daily.sla_breaches}), 0)` }).from(agent_kpi_daily).where(gte(agent_kpi_daily.day_key, since)),
    ]);

    return {
      total_orders_processed: Number(total_processed[0]?.value ?? 0),
      total_cases_resolved: Number(total_cases[0]?.value ?? 0),
      total_tasks_completed: Number(total_tasks[0]?.value ?? 0),
      total_sla_breaches: Number(total_sla_breaches[0]?.value ?? 0),
    };
  }
}

export const agent_kpi_service = new AgentKPIService();
