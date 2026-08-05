import "server-only";
import { and, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analytics_funnel_daily } from "../schema";
import { FUNNEL_STEP } from "../constants/event-types";

const STEP_ORDER = [
  FUNNEL_STEP.view,
  FUNNEL_STEP.add_to_cart,
  FUNNEL_STEP.checkout,
  FUNNEL_STEP.purchase,
];

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
      .groupBy(analytics_funnel_daily.step);

    const by_step = new Map(rows.map((r) => [r.step, r.sessions]));

    return STEP_ORDER.map((step) => {
      const sessions = by_step.get(step) ?? 0;
      return { step, sessions };
    }).map((r, _idx, ordered) => {
      const base = ordered[0]?.sessions || 1;
      return {
        step: r.step,
        sessions: r.sessions,
        rate: Number((r.sessions / base).toFixed(4)),
      };
    });
  },
};
