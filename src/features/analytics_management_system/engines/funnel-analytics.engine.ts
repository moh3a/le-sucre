import "server-only";
import { and, asc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analytics_funnel_daily } from "../schema";

export const funnel_analytics_engine = {
  async steps(from: string, to: string) {
    const rows = await db
      .select({
        step: analytics_funnel_daily.step,
        sessions: sql<number>`SUM(${analytics_funnel_daily.sessions})`.mapWith(Number),
      })
      .from(analytics_funnel_daily)
      .where(
        and(gte(analytics_funnel_daily.day_key, from), lte(analytics_funnel_daily.day_key, to)),
      )
      .groupBy(analytics_funnel_daily.step)
      .orderBy(asc(analytics_funnel_daily.step));

    const base = rows[0]?.sessions || 1;
    return rows.map((r) => ({
      step: r.step,
      sessions: r.sessions,
      rate: Number((r.sessions / base).toFixed(4)),
    }));
  },
};
