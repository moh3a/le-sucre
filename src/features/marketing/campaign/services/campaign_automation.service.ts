import "server-only";
import logger from "@/lib/logger";
import { db } from "@/lib/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { catch_drizzle, type DrizzleErrorDef } from "@/lib/db/drizzle-error";
import { NotFoundError } from "@/lib/error_handling";
import { campaign_automation_rules, campaign_automation_log } from "../schema";

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

export type AutomationRule = typeof campaign_automation_rules.$inferSelect;
export type AutomationLog = typeof campaign_automation_log.$inferSelect;

// ─── Descriptive per-operation fallback messages ──────────────────────────────
// Shown whenever the underlying database call fails with an unknown error.

const FALLBACKS = {
  fetch_rules: {
    code: "AUTOMATION_RULES_FETCH_FAILED",
    status: 500,
    message: {
      fr: "Impossible de récupérer les règles d'automatisation",
      en: "Unable to fetch automation rules",
      ar: "تعذر جلب قواعد الأتمتة",
    },
  },
  create_rule: {
    code: "AUTOMATION_RULE_CREATE_FAILED",
    status: 500,
    message: {
      fr: "Impossible de créer la règle d'automatisation",
      en: "Unable to create the automation rule",
      ar: "تعذر إنشاء قاعدة الأتمتة",
    },
  },
  update_rule: {
    code: "AUTOMATION_RULE_UPDATE_FAILED",
    status: 500,
    message: {
      fr: "Impossible de modifier la règle d'automatisation",
      en: "Unable to update the automation rule",
      ar: "تعذر تحديث قاعدة الأتمتة",
    },
  },
  delete_rule: {
    code: "AUTOMATION_RULE_DELETE_FAILED",
    status: 500,
    message: {
      fr: "Impossible de supprimer la règle d'automatisation",
      en: "Unable to delete the automation rule",
      ar: "تعذر حذف قاعدة الأتمتة",
    },
  },
  fetch_logs: {
    code: "AUTOMATION_LOGS_FETCH_FAILED",
    status: 500,
    message: {
      fr: "Impossible de récupérer l'historique d'exécution",
      en: "Unable to fetch the execution history",
      ar: "تعذر جلب سجل التنفيذ",
    },
  },
} satisfies Record<string, DrizzleErrorDef>;

export class CampaignAutomationService {
  /**
   * Evaluates every active rule matching the trigger and campaign, then
   * executes the matching actions. Failures never propagate to the caller:
   * automation is a best-effort side effect and must not break the campaign.
   *
   * TODO: the following triggers are defined but never dispatched by any
   * caller — wire them up:
   *  - campaign.scheduled          (fires when a scheduled campaign is due, requires a scheduler consumer)
   *  - campaign.status_changed     (fires on any status transition)
   *  - campaign.flash_sale_starting / campaign.flash_sale_ending
   *  - campaign.analytics_threshold_met (fires when analytics metrics cross configured thresholds)
   */
  async process_trigger(
    trigger: AutomationTrigger,
    campaign: {
      id: string;
      name: string;
      campaign_type: string;
      status: string;
    },
  ): Promise<void> {
    let rules: AutomationRule[] = [];
    try {
      rules = await this._fetch_matching_rules(trigger, campaign);
    } catch (err) {
      logger.error("automation_trigger_fetch_failed", {
        trigger,
        campaign_id: campaign.id,
        error: err instanceof Error ? err.message : String(err),
      });
      return;
    }

    for (const rule of rules) {
      try {
        await this._execute_action(rule, campaign);
        await this._write_log({
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
        try {
          await this._write_log({
            rule_id: rule.id,
            campaign_id: campaign.id,
            trigger,
            action: rule.action,
            status: "failed",
            result: { error: message },
          });
        } catch (logErr) {
          logger.error("automation_log_write_failed", {
            trigger,
            campaign_id: campaign.id,
            error: logErr instanceof Error ? logErr.message : String(logErr),
          });
        }
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
  }): Promise<AutomationRule> {
    const id = generate_id();
    await catch_drizzle(
      db.insert(campaign_automation_rules).values({
        id,
        name: input.name,
        trigger: input.trigger,
        action: input.action,
        campaign_type_filter: input.campaign_type_filter ?? null,
        status_filter: input.status_filter ?? null,
        config: input.config,
        is_active: true,
        priority: input.priority ?? 100,
      }),
      FALLBACKS.create_rule,
    );

    const [row] = await catch_drizzle(
      db
        .select()
        .from(campaign_automation_rules)
        .where(eq(campaign_automation_rules.id, id))
        .limit(1),
      FALLBACKS.create_rule,
    );
    if (!row) {
      throw new NotFoundError("L'automatisation créée est introuvable");
    }
    return row;
  }

  async list_rules(): Promise<AutomationRule[]> {
    return catch_drizzle(
      db.select().from(campaign_automation_rules).orderBy(desc(campaign_automation_rules.priority)),
      FALLBACKS.fetch_rules,
    );
  }

  async toggle_rule(id: string, is_active: boolean): Promise<void> {
    const [result] = await catch_drizzle(
      db
        .update(campaign_automation_rules)
        .set({ is_active })
        .where(eq(campaign_automation_rules.id, id)),
      FALLBACKS.update_rule,
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError("La règle d'automatisation est introuvable");
    }
  }

  async delete_rule(id: string): Promise<void> {
    const [result] = await catch_drizzle(
      db.delete(campaign_automation_rules).where(eq(campaign_automation_rules.id, id)),
      FALLBACKS.delete_rule,
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError("La règle d'automatisation est introuvable");
    }
  }

  async get_logs(campaign_id?: string, limit = 50): Promise<AutomationLog[]> {
    const clauses = [];
    if (campaign_id) clauses.push(eq(campaign_automation_log.campaign_id, campaign_id));
    return catch_drizzle(
      db
        .select()
        .from(campaign_automation_log)
        .where(clauses.length ? and(...clauses) : undefined)
        .orderBy(desc(campaign_automation_log.created_at))
        .limit(limit),
      FALLBACKS.fetch_logs,
    );
  }

  private async _fetch_matching_rules(
    trigger: AutomationTrigger,
    campaign: { campaign_type: string; status: string },
  ): Promise<AutomationRule[]> {
    return catch_drizzle(
      db
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
        .orderBy(sql`${campaign_automation_rules.priority} ASC`),
      FALLBACKS.fetch_rules,
    );
  }

  private async _write_log(input: {
    rule_id: string;
    campaign_id: string;
    trigger: string;
    action: string;
    status: "pending" | "completed" | "failed";
    result: Record<string, unknown>;
  }): Promise<void> {
    await catch_drizzle(
      db.insert(campaign_automation_log).values({
        id: generate_id(),
        rule_id: input.rule_id,
        campaign_id: input.campaign_id,
        trigger: input.trigger,
        action: input.action,
        status: input.status,
        result: input.result,
      }),
      FALLBACKS.fetch_logs,
    );
  }

  private async _execute_action(
    rule: AutomationRule,
    campaign: {
      id: string;
      name: string;
      campaign_type: string;
      status: string;
    },
  ): Promise<void> {
    const config = rule.config ?? {};

    switch (rule.action) {
      case "send_email": {
        // TODO: integrate the email provider (via the email/notification abstraction) to actually
        // deliver the campaign notification template. Currently only logs the intent.
        const template = (config.template as string) ?? "campaign_notification";
        logger.info("automation_send_email", {
          campaign_id: campaign.id,
          template,
          to: config.to,
        });
        break;
      }
      case "send_push": {
        // TODO: integrate the push notification provider to deliver the notification.
        // Currently only logs the intent.
        logger.info("automation_send_push", {
          campaign_id: campaign.id,
          title: config.title,
          body: config.body,
        });
        break;
      }
      case "create_order_promotion": {
        // TODO: create a promotion record via the promotions service and link it to the campaign.
        // Currently only logs the intended promotion config.
        const promo = (config.promotion_config as Record<string, unknown>) ?? {};
        logger.info("automation_create_promotion", {
          campaign_id: campaign.id,
          promo,
        });
        break;
      }
      case "update_product_prices": {
        // TODO: apply the discount percentage to the campaign's products via the product price
        // service. Currently only logs the intended discount.
        const discount_pct = (config.discount_percentage as number) ?? 0;
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
        // TODO: POST the campaign event to the configured webhook_url via the webhook dispatch
        // service instead of logging the intent.
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
        // TODO: integrate the SMS provider to send the configured message.
        // Currently only logs the intent.
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
