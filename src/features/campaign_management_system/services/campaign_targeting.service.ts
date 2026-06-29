import "server-only";
import { db } from "@/lib/db";
import { eq, and, inArray, sql, gte, lte } from "drizzle-orm";
import { campaign_targets, campaigns } from "../schema";
import { TARGET_TYPE, CAMPAIGN_STATUS } from "../constants/campaign_types";
import { subDays } from "date-fns";

export interface TargetingContext {
  locale: string;
  country?: string;
  user_id?: string;
  customer_group?: string;
  session_id?: string;
  viewed_product_ids?: string[];
  purchased_category_ids?: string[];
  device_type?: "desktop" | "mobile" | "tablet";
  referrer?: string;
}

export interface BehaviorRuleResult {
  matched: boolean;
  score: number;
  rule_name: string;
}

export class CampaignTargetingService {
  async evaluate_campaign(campaign_id: string, ctx: TargetingContext): Promise<boolean> {
    const targets = await db
      .select()
      .from(campaign_targets)
      .where(eq(campaign_targets.campaign_id, campaign_id));

    if (!targets.length) return true;

    const inclusive = targets.filter((t) => t.is_inclusive);
    const exclusive = targets.filter((t) => !t.is_inclusive);

    for (const ex of exclusive) {
      if (await this._match_target(ex, ctx)) return false;
    }

    if (!inclusive.length) return true;

    if (inclusive.some((t) => t.target_type === TARGET_TYPE.all)) return true;

    for (const inc of inclusive) {
      if (await this._match_target(inc, ctx)) return true;
    }

    return false;
  }

  async evaluate_behavior_rules(campaign_id: string, ctx: TargetingContext): Promise<BehaviorRuleResult> {
    const rules = await db
      .select()
      .from(campaign_targets)
      .where(
        and(
          eq(campaign_targets.campaign_id, campaign_id),
          eq(campaign_targets.target_type, TARGET_TYPE.behavior),
        ),
      );

    let best: BehaviorRuleResult = { matched: false, score: 0, rule_name: "" };

    for (const rule of rules) {
      if (!rule.behavior_rule) continue;
      const result = await this._evaluate_behavior_rule(rule.behavior_rule, rule.config as Record<string, unknown> ?? {}, ctx);
      if (result.matched && result.score > best.score) {
        best = result;
      }
    }

    return best;
  }

  async find_matching_campaigns(ctx: TargetingContext): Promise<Array<{ campaign_id: string; score: number }>> {
    const active = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.status, CAMPAIGN_STATUS.active),
          or(sql`${campaigns.starts_at} IS NULL`, lte(campaigns.starts_at, sql`NOW()`)),
          or(sql`${campaigns.ends_at} IS NULL`, gte(campaigns.ends_at, sql`NOW()`)),
        ),
      );

    const results: Array<{ campaign_id: string; score: number }> = [];

    for (const campaign of active) {
      const matches = await this.evaluate_campaign(campaign.id, ctx);
      if (!matches) continue;

      const behavior = await this.evaluate_behavior_rules(campaign.id, ctx);
      const base_score = campaign.priority ?? 100;
      const score = base_score + (behavior.matched ? behavior.score : 0);

      results.push({ campaign_id: campaign.id, score });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  async get_personalized_campaigns(user_id: string, locale: string, country?: string): Promise<string[]> {
    const ctx: TargetingContext = { user_id, locale, country };

    const recent_views = await db
      .select({ product_id: sql<string>`product_id` })
      .from(sql`product_views`)
      .where(
        and(
          eq(sql`product_views.user_id`, user_id),
          gte(sql`product_views.viewed_at`, sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`),
        ),
      )
      .orderBy(sql`MAX(viewed_at) DESC`)
      .groupBy(sql`product_id`)
      .limit(10)
      .then((rows) => rows.map((r) => r.product_id));

    ctx.viewed_product_ids = recent_views;

    if (recent_views.length > 0) {
      const cats = await db
        .select({ category_id: sql<string>`DISTINCT p.category_id` })
        .from(sql`products p`)
        .where(inArray(sql`p.id`, recent_views))
        .then((rows) => rows.map((r) => r.category_id).filter(Boolean) as string[]);
      ctx.purchased_category_ids = cats;
    }

    const matched = await this.find_matching_campaigns(ctx);

    return matched.map((m) => m.campaign_id);
  }

  private async _match_target(
    target: typeof campaign_targets.$inferSelect,
    ctx: TargetingContext,
  ): Promise<boolean> {
    switch (target.target_type) {
      case TARGET_TYPE.language:
        return target.target_value === ctx.locale;
      case TARGET_TYPE.country:
        return target.target_value === ctx.country;
      case TARGET_TYPE.new_customer:
        return !ctx.user_id;
      case TARGET_TYPE.returning_customer:
        return !!ctx.user_id;
      case TARGET_TYPE.customer_group:
        return target.target_value === ctx.customer_group;
      case TARGET_TYPE.behavior:
        return false;
      case TARGET_TYPE.category: {
        if (!ctx.purchased_category_ids?.length || !target.target_value) return false;
        return ctx.purchased_category_ids.includes(target.target_value);
      }
      case TARGET_TYPE.all:
        return true;
      default:
        return false;
    }
  }

  private async _evaluate_behavior_rule(
    rule: string,
    config: Record<string, unknown>,
    ctx: TargetingContext,
  ): Promise<BehaviorRuleResult> {
    switch (rule) {
      case "viewed_product": {
        if (!ctx.viewed_product_ids?.length || !config.product_ids) return { matched: false, score: 0, rule_name: rule };
        const target_ids = config.product_ids as string[];
        const intersection = ctx.viewed_product_ids.filter((id) => target_ids.includes(id));
        return {
          matched: intersection.length > 0,
          score: intersection.length * 10,
          rule_name: rule,
        };
      }
      case "purchased_category": {
        if (!ctx.purchased_category_ids?.length || !config.category_ids) return { matched: false, score: 0, rule_name: rule };
        const target_cats = config.category_ids as string[];
        const intersection = ctx.purchased_category_ids.filter((id) => target_cats.includes(id));
        return {
          matched: intersection.length > 0,
          score: intersection.length * 15,
          rule_name: rule,
        };
      }
      case "cart_abandoned": {
        if (!ctx.user_id) return { matched: false, score: 0, rule_name: rule };
        const abandoned = await db
          .select({ count: sql<number>`count(*)` })
          .from(sql`carts`)
          .where(
            and(
              eq(sql`carts.user_id`, ctx.user_id),
              eq(sql`carts.status`, "abandoned"),
              gte(sql`carts.updated_at`, sql`DATE_SUB(NOW(), INTERVAL 7 DAY)`),
            ),
          );
        return {
          matched: abandoned[0]?.count > 0,
          score: abandoned[0]?.count ? Math.min(abandoned[0].count * 20, 100) : 0,
          rule_name: rule,
        };
      }
      case "high_value_customer": {
        if (!ctx.user_id) return { matched: false, score: 0, rule_name: rule };
        const threshold = (config.min_total as number) ?? 500;
        const spent = await db
          .select({ total: sql<number>`COALESCE(SUM(total), 0)` })
          .from(sql`orders`)
          .where(and(eq(sql`orders.user_id`, ctx.user_id), eq(sql`orders.status`, "delivered")));
        const total_spent = Number(spent[0]?.total ?? 0);
        return {
          matched: total_spent >= threshold,
          score: Math.min(Math.floor(total_spent / 100) * 5, 100),
          rule_name: rule,
        };
      }
      case "recent_visitor": {
        const days = (config.days as number) ?? 7;
        if (!ctx.user_id) return { matched: false, score: 0, rule_name: rule };
        const visits = await db
          .select({ count: sql<number>`count(*)` })
          .from(sql`sessions`)
          .where(
            and(
              eq(sql`sessions.user_id`, ctx.user_id),
              gte(sql`sessions.created_at`, sql`DATE_SUB(NOW(), INTERVAL ${days} DAY)`),
            ),
          );
        return {
          matched: (visits[0]?.count ?? 0) > 0,
          score: 25,
          rule_name: rule,
        };
      }
      case "device_type": {
        return {
          matched: ctx.device_type === (config.device as string),
          score: 30,
          rule_name: rule,
        };
      }
      case "referrer": {
        const ref = config.referrer_domain as string;
        if (!ref || !ctx.referrer) return { matched: false, score: 0, rule_name: rule };
        return {
          matched: ctx.referrer.includes(ref),
          score: 20,
          rule_name: rule,
        };
      }
      default:
        return { matched: false, score: 0, rule_name: rule };
    }
  }
}

export const campaign_targeting_service = new CampaignTargetingService();

function or(...conditions: ReturnType<typeof sql>[]) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}
