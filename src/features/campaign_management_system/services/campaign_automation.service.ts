import "server-only";
import logger from "@/lib/logger";
import { db } from "@/lib/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { mysqlTable, varchar, json, timestamp, index, int, boolean } from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";

export type AutomationTrigger =
  | "campaign.activated"
  | "campaign.ended"
  | "campaign.paused"
  | "campaign.flash_sale_starting"
  | "campaign.flash_sale_ending"
  | "campaign.analytics_threshold_met"
  | "campaign.scheduled"
  | "campaign.status_changed";

export type AutomationAction =
  | "send_email"
  | "send_push"
  | "create_order_promotion"
  | "update_product_prices"
  | "invalidate_cache"
  | "dispatch_webhook"
  | "trigger_sms";

export const campaign_automation_rules = mysqlTable(
  "campaign_automation_rules",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    trigger: varchar("trigger", { length: 64 }).notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    campaign_type_filter: varchar("campaign_type_filter", { length: 64 }),
    status_filter: varchar("status_filter", { length: 32 }),
    config: json("config").$type<Record<string, unknown>>().notNull().default({}),
    is_active: boolean("is_active").notNull().default(true),
    priority: int("priority").notNull().default(100),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("automation_rules_trigger_idx").on(t.trigger, t.is_active),
  ],
);

export const campaign_automation_log = mysqlTable(
  "campaign_automation_log",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    rule_id: varchar("rule_id", { length: 255 }).notNull(),
    campaign_id: varchar("campaign_id", { length: 255 }).notNull(),
    trigger: varchar("trigger", { length: 64 }).notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    result: json("result").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("automation_log_campaign_idx").on(t.campaign_id),
  ],
);

export class CampaignAutomationService {
  async process_trigger(
    trigger: AutomationTrigger,
    campaign: {
      id: string;
      name: string;
      campaign_type: string;
      status: string;
    },
    extra?: Record<string, unknown>,
  ): Promise<void> {
    const rules = await db
      .select()
      .from(campaign_automation_rules)
      .where(
        and(
          eq(campaign_automation_rules.trigger, trigger),
          eq(campaign_automation_rules.is_active, true),
          or(
            sql`${campaign_automation_rules.campaign_type_filter} IS NULL`,
            eq(campaign_automation_rules.campaign_type_filter, campaign.campaign_type),
          ),
          or(
            sql`${campaign_automation_rules.status_filter} IS NULL`,
            eq(campaign_automation_rules.status_filter, campaign.status),
          ),
        ),
      )
      .orderBy(sql`${campaign_automation_rules.priority} ASC`);

    for (const rule of rules) {
      try {
        await this._execute_action(rule, campaign, extra);
        await db.insert(campaign_automation_log).values({
          id: generate_id(),
          rule_id: rule.id,
          campaign_id: campaign.id,
          trigger,
          action: rule.action,
          status: "completed",
          result: { executed_at: new Date().toISOString() },
        });
        logger.info("automation_rule_executed", {
          rule_id: rule.id,
          trigger,
          campaign_id: campaign.id,
          action: rule.action,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await db.insert(campaign_automation_log).values({
          id: generate_id(),
          rule_id: rule.id,
          campaign_id: campaign.id,
          trigger,
          action: rule.action,
          status: "failed",
          result: { error: message },
        });
        logger.error("automation_rule_failed", {
          rule_id: rule.id,
          trigger,
          campaign_id: campaign.id,
          error: message,
        });
      }
    }
  }

  async create_rule(input: {
    name: string;
    trigger: AutomationTrigger;
    action: AutomationAction;
    campaign_type_filter?: string;
    status_filter?: string;
    config: Record<string, unknown>;
    priority?: number;
  }): Promise<typeof campaign_automation_rules.$inferSelect> {
    const id = generate_id();
    await db.insert(campaign_automation_rules).values({
      id,
      name: input.name,
      trigger: input.trigger,
      action: input.action,
      campaign_type_filter: input.campaign_type_filter ?? null,
      status_filter: input.status_filter ?? null,
      config: input.config,
      is_active: true,
      priority: input.priority ?? 100,
    });
    const [row] = await db.select().from(campaign_automation_rules).where(eq(campaign_automation_rules.id, id)).limit(1);
    return row!;
  }

  async list_rules(): Promise<typeof campaign_automation_rules.$inferSelect[]> {
    return db
      .select()
      .from(campaign_automation_rules)
      .orderBy(desc(campaign_automation_rules.priority));
  }

  async get_logs(campaign_id?: string, limit = 50): Promise<typeof campaign_automation_log.$inferSelect[]> {
    const clauses = [];
    if (campaign_id) clauses.push(eq(campaign_automation_log.campaign_id, campaign_id));
    return db
      .select()
      .from(campaign_automation_log)
      .where(clauses.length ? and(...clauses) : undefined)
      .orderBy(desc(campaign_automation_log.created_at))
      .limit(limit);
  }

  private async _execute_action(
    rule: typeof campaign_automation_rules.$inferSelect,
    campaign: {
      id: string;
      name: string;
      campaign_type: string;
      status: string;
    },
    extra?: Record<string, unknown>,
  ): Promise<void> {
    const config = rule.config ?? {};

    switch (rule.action) {
      case "send_email": {
        const template = config.template as string ?? "campaign_notification";
        logger.info("automation_send_email", {
          campaign_id: campaign.id,
          template,
          to: config.to,
        });
        break;
      }
      case "send_push": {
        logger.info("automation_send_push", {
          campaign_id: campaign.id,
          title: config.title,
          body: config.body,
        });
        break;
      }
      case "create_order_promotion": {
        const promo = config.promotion_config as Record<string, unknown> ?? {};
        logger.info("automation_create_promotion", {
          campaign_id: campaign.id,
          promo,
        });
        break;
      }
      case "update_product_prices": {
        const discount_pct = config.discount_percentage as number ?? 0;
        logger.info("automation_update_prices", {
          campaign_id: campaign.id,
          discount_pct,
        });
        break;
      }
      case "invalidate_cache": {
        const { campaign_cache } = await import("./campaign_cache.service");
        await campaign_cache.invalidate(campaign.id);
        await campaign_cache.invalidate_all_sections();
        break;
      }
      case "dispatch_webhook": {
        const webhook_url = config.webhook_url as string;
        if (webhook_url) {
          logger.info("automation_dispatch_webhook", {
            campaign_id: campaign.id,
            url: webhook_url,
          });
        }
        break;
      }
      case "trigger_sms": {
        logger.info("automation_trigger_sms", {
          campaign_id: campaign.id,
          phone: config.phone,
          message: config.message,
        });
        break;
      }
      default:
        logger.warn("unknown_automation_action", { action: rule.action });
    }
  }
}

export const campaign_automation_service = new CampaignAutomationService();

function or(...conditions: ReturnType<typeof sql>[]) {
  return sql`(${sql.join(conditions, sql` OR `)})`;
}
