import "server-only";
import { randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { eq, and, gte, lte, sql, inArray, asc } from "drizzle-orm";
import { campaigns, campaign_analytics_daily } from "../schema";
import { CAMPAIGN_STATUS } from "../constants/campaign_types";
import { format, subDays } from "date-fns";

export interface ABTestVariantResult {
  variant_id: string;
  campaign_id: string;
  name: string;
  traffic_split: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
  winner: boolean;
  confidence: number;
}

export interface ABTestReport {
  test_group: string;
  variants: ABTestVariantResult[];
  total_impressions: number;
  total_conversions: number;
  started_at: string | null;
  ended_at: string | null;
  significant: boolean;
  winner_id: string | null;
}

export interface ABTestGroupOverview extends ABTestReport {
  campaign_ids: string[];
  active_variants: number;
}

export class CampaignABTestService {
  async get_variant_for_user(
    test_group: string,
    user_id?: string,
    session_seed?: number,
  ): Promise<{
    campaign_id: string;
    ab_test_group: string;
    ab_traffic_split: number;
  } | null> {
    const group_campaigns = await db
      .select({
        id: campaigns.id,
        ab_test_group: campaigns.ab_test_group,
        ab_traffic_split: campaigns.ab_traffic_split,
        priority: campaigns.priority,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.ab_test_group, test_group),
          eq(campaigns.status, CAMPAIGN_STATUS.active),
          or(
            sql`${campaigns.starts_at} IS NULL`,
            lte(campaigns.starts_at, format(new Date(), "yyyy-MM-dd HH:mm:ss")),
          ),
          or(
            sql`${campaigns.ends_at} IS NULL`,
            gte(campaigns.ends_at, format(new Date(), "yyyy-MM-dd HH:mm:ss")),
          ),
        ),
      )
      .orderBy(sql`RAND()`);

    if (!group_campaigns.length) return null;

    const now_iso = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    for (const c of group_campaigns) {
      const check = await db
        .select()
        .from(campaigns)
        .where(
          and(
            eq(campaigns.id, c.id),
            eq(campaigns.status, CAMPAIGN_STATUS.active),
            or(sql`${campaigns.starts_at} IS NULL`, lte(campaigns.starts_at, now_iso)),
            or(sql`${campaigns.ends_at} IS NULL`, gte(campaigns.ends_at, now_iso)),
          ),
        )
        .limit(1);
      if (!check.length) continue;

      const assign_pct = c.ab_traffic_split ?? 100;
      const roll = this._deterministic_roll(c.id, user_id, session_seed);
      if (roll <= assign_pct) {
        return {
          campaign_id: c.id,
          ab_test_group: test_group,
          ab_traffic_split: assign_pct,
        };
      }
    }

    return null;
  }

  async get_ab_test_report(test_group: string, days = 30): Promise<ABTestReport> {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");
    const now = format(new Date(), "yyyy-MM-dd");

    const group_campaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.ab_test_group, test_group));

    if (!group_campaigns.length) {
      return {
        test_group,
        variants: [],
        total_impressions: 0,
        total_conversions: 0,
        started_at: null,
        ended_at: null,
        significant: false,
        winner_id: null,
      };
    }

    const analytics_rows = await this._analytics_rows(group_campaigns, since, now);
    const { variants, total_impressions, total_conversions, started_at, ended_at } =
      this._aggregate_group(group_campaigns, analytics_rows);

    const best_conversion = Math.max(...variants.map((v) => v.conversion_rate));
    const report: ABTestReport = {
      test_group,
      variants: variants.map((v) => ({
        ...v,
        winner: v.conversion_rate === best_conversion && best_conversion > 0,
        confidence: this._calculate_confidence(
          v.impressions,
          v.conversions,
          total_impressions,
          total_conversions,
        ),
      })),
      total_impressions,
      total_conversions,
      started_at,
      ended_at,
      significant: false,
      winner_id: null,
    };

    const winning = report.variants.find((v) => v.winner);
    if (winning) {
      report.winner_id = winning.variant_id;
      if (total_impressions > 0) {
        report.significant = this._is_significant(
          best_conversion,
          variants.filter((v) => v.conversion_rate !== best_conversion),
          total_impressions,
        );
      }
    }

    return report;
  }

  /** Overview of every A/B test group with aggregated performance for the dashboard */
  async get_ab_test_overview(days = 30): Promise<ABTestGroupOverview[]> {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");
    const now = format(new Date(), "yyyy-MM-dd");

    const groups = await db
      .selectDistinct({ test_group: campaigns.ab_test_group })
      .from(campaigns)
      .where(sql`${campaigns.ab_test_group} IS NOT NULL AND ${campaigns.ab_test_group} != ''`);

    if (!groups.length) return [];

    const group_names = groups.map((g) => g.test_group).filter((g): g is string => Boolean(g));

    const group_campaigns = await db
      .select()
      .from(campaigns)
      .where(inArray(campaigns.ab_test_group, group_names))
      .orderBy(asc(campaigns.priority));

    const analytics_rows = await this._analytics_rows(group_campaigns, since, now);

    const overview: ABTestGroupOverview[] = [];
    for (const test_group of group_names) {
      const members = group_campaigns.filter((c) => c.ab_test_group === test_group);
      if (!members.length) continue;

      const { variants, total_impressions, total_conversions, started_at, ended_at } =
        this._aggregate_group(members, analytics_rows);

      const best_conversion = Math.max(...variants.map((v) => v.conversion_rate));
      const computed = variants.map((v) => ({
        ...v,
        winner: v.conversion_rate === best_conversion && best_conversion > 0,
        confidence: this._calculate_confidence(
          v.impressions,
          v.conversions,
          total_impressions,
          total_conversions,
        ),
      }));

      const winning = computed.find((v) => v.winner);
      overview.push({
        test_group,
        variants: computed,
        campaign_ids: members.map((c) => c.id),
        active_variants: members.filter((c) => c.status === CAMPAIGN_STATUS.active).length,
        total_impressions,
        total_conversions,
        started_at,
        ended_at,
        significant:
          !!winning &&
          total_impressions > 0 &&
          this._is_significant(
            best_conversion,
            variants.filter((v) => v.conversion_rate !== best_conversion),
            total_impressions,
          ),
        winner_id: winning?.variant_id ?? null,
      });
    }

    return overview.sort((a, b) => b.total_impressions - a.total_impressions);
  }

  private async _analytics_rows(
    group_campaigns: (typeof campaigns.$inferSelect)[],
    since: string,
    now: string,
  ) {
    const variant_ids = group_campaigns.map((c) => c.id);
    if (!variant_ids.length) return [];
    return db
      .select()
      .from(campaign_analytics_daily)
      .where(
        and(
          inArray(campaign_analytics_daily.campaign_id, variant_ids),
          gte(campaign_analytics_daily.day_key, since),
          lte(campaign_analytics_daily.day_key, now),
        ),
      );
  }

  private _aggregate_group(
    group_campaigns: (typeof campaigns.$inferSelect)[],
    analytics_rows: (typeof campaign_analytics_daily.$inferSelect)[],
  ) {
    const variants: ABTestVariantResult[] = [];
    let total_impressions = 0;
    let total_conversions = 0;

    for (const campaign of group_campaigns) {
      const rows = analytics_rows.filter((r) => r.campaign_id === campaign.id);
      const impressions = rows.reduce((s, r) => s + r.impressions, 0);
      const clicks = rows.reduce((s, r) => s + r.clicks, 0);
      const conversions = rows.reduce((s, r) => s + r.conversions, 0);
      const revenue = rows.reduce((s, r) => s + Number(r.revenue), 0);

      total_impressions += impressions;
      total_conversions += conversions;

      variants.push({
        variant_id: campaign.id,
        campaign_id: campaign.id,
        name: campaign.name,
        traffic_split: campaign.ab_traffic_split ?? 100,
        impressions,
        clicks,
        conversions,
        revenue,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        conversion_rate: impressions > 0 ? (conversions / impressions) * 100 : 0,
        winner: false,
        confidence: 0,
      });
    }

    const started_at = group_campaigns.reduce((earliest: string | null, c) => {
      return !earliest || (c.starts_at && c.starts_at < earliest) ? c.starts_at : earliest;
    }, null);
    const ended_at = group_campaigns.reduce((latest: string | null, c) => {
      return !latest || (c.ends_at && c.ends_at > latest) ? c.ends_at : latest;
    }, null);

    return { variants, total_impressions, total_conversions, started_at, ended_at };
  }

  private _deterministic_roll(
    campaign_id: string,
    user_id?: string,
    session_seed?: number,
  ): number {
    const seed = session_seed ?? (user_id ? this._hash_string(user_id) : randomInt(1, 10000));
    const combined = `${campaign_id}:${seed}`;
    const hash = this._hash_string(combined);
    return (hash % 100) + 1;
  }

  private _hash_string(s: string): number {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private _calculate_confidence(
    variant_impressions: number,
    variant_conversions: number,
    total_impressions: number,
    total_conversions: number,
  ): number {
    if (total_impressions === 0 || variant_impressions === 0) return 0;
    const control_rate =
      (total_conversions - variant_conversions) /
      Math.max(total_impressions - variant_impressions, 1);
    const variant_rate = variant_conversions / variant_impressions;
    if (variant_rate <= control_rate) return 0;
    const relative_improvement = (variant_rate - control_rate) / Math.max(control_rate, 0.0001);
    return Math.min(Math.round(relative_improvement * 100), 99);
  }

  private _is_significant(
    best_rate: number,
    others: ABTestVariantResult[],
    total_impressions: number,
  ): boolean {
    const min_sample = 100;
    if (total_impressions < min_sample) return false;
    if (others.length === 0) return false;
    for (const other of others) {
      if (other.impressions < min_sample) return false;
      if (Math.abs(best_rate - other.conversion_rate) < 0.5) return false;
    }
    return true;
  }
}

export const campaign_ab_test_service = new CampaignABTestService();

function or(...conditions: ReturnType<typeof sql>[]) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}
