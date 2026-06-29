import "server-only";
import logger from "@/lib/logger";
import { db } from "@/lib/db";
import { eq, and, gte, lte, asc, desc, sql } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { sla_definitions, sla_tracking } from "../schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export type SLAEntityType = "support_case" | "task" | "order_escalation";

export class SLAEngineService {
  async create_definition(input: {
    entity_type: string;
    priority: string;
    response_hours: number;
    resolution_hours: number;
    escalation_minutes: number;
    escalate_to_role?: string;
  }) {
    const id = generate_id();
    await db.insert(sla_definitions).values({ id, ...input, is_active: true });
    return this._get(id);
  }

  async start_tracking(entity_type: string, entity_id: string, priority: string) {
    const def = await db
      .select()
      .from(sla_definitions)
      .where(and(eq(sla_definitions.entity_type, entity_type), eq(sla_definitions.priority, priority), eq(sla_definitions.is_active, true)))
      .limit(1);

    if (!def.length) return null;

    const now = new Date();
    const response_due = def[0].response_hours ? new Date(now.getTime() + def[0].response_hours * 3600000) : null;
    const resolution_due = def[0].resolution_hours ? new Date(now.getTime() + def[0].resolution_hours * 3600000) : null;

    const id = generate_id();
    await db.insert(sla_tracking).values({
      id,
      sla_definition_id: def[0].id,
      entity_type,
      entity_id,
      status: "active",
      started_at: now.toISOString(),
      response_due_at: response_due?.toISOString() ?? null,
      resolution_due_at: resolution_due?.toISOString() ?? null,
    });

    return this._get_tracking(id);
  }

  async mark_responded(entity_type: string, entity_id: string) {
    const track = await this._find_active_tracking(entity_type, entity_id);
    if (!track) return null;

    await db
      .update(sla_tracking)
      .set({
        responded_at: sql`NOW()`,
        status: track.response_due_at ? "awaiting_resolution" : "resolved",
      })
      .where(eq(sla_tracking.id, track.id));

    return this._get_tracking(track.id);
  }

  async mark_resolved(entity_type: string, entity_id: string) {
    const track = await this._find_active_tracking(entity_type, entity_id);
    if (!track) return null;

    await db
      .update(sla_tracking)
      .set({ resolved_at: sql`NOW()`, status: "resolved" })
      .where(eq(sla_tracking.id, track.id));

    void audit_service.log({
      action: "sla.resolved",
      resource_type: entity_type,
      resource_id: entity_id,
      metadata: { sla_tracking_id: track.id },
    });

    return this._get_tracking(track.id);
  }

  async process_escalations(): Promise<number> {
    const now = sql`NOW()`;
    const overdue = await db
      .select()
      .from(sla_tracking)
      .where(
        and(
          eq(sla_tracking.status, "active"),
          lte(sla_tracking.response_due_at!, now),
        ),
      )
      .limit(50);

    let escalated = 0;
    for (const track of overdue) {
      const def = await this._get(track.sla_definition_id);
      if (!def) continue;

      const next_escalation = track.last_escalated_at
        ? new Date(new Date(track.last_escalated_at).getTime() + def.escalation_minutes * 60000)
        : new Date(new Date(track.started_at).getTime() + def.response_hours * 3600000 + def.escalation_minutes * 60000);

      if (new Date() >= next_escalation) {
        await db
          .update(sla_tracking)
          .set({
            escalation_count: sql`${sla_tracking.escalation_count} + 1`,
            last_escalated_at: sql`NOW()`,
          })
          .where(eq(sla_tracking.id, track.id));

        logger.info("sla_escalated", {
          entity_type: track.entity_type,
          entity_id: track.entity_id,
          escalation_count: track.escalation_count + 1,
          escalate_to_role: def.escalate_to_role,
        });

        void audit_service.log({
          action: "sla.escalated",
          resource_type: track.entity_type,
          resource_id: track.entity_id,
          metadata: { sla_tracking_id: track.id, count: track.escalation_count + 1 },
        });

        escalated++;
      }
    }
    return escalated;
  }

  async get_tracking_for_entity(entity_type: string, entity_id: string) {
    return db
      .select()
      .from(sla_tracking)
      .where(and(eq(sla_tracking.entity_type, entity_type), eq(sla_tracking.entity_id, entity_id)))
      .orderBy(desc(sla_tracking.created_at));
  }

  async get_overdue_list(entity_type?: string) {
    const clauses = [eq(sla_tracking.status, "active"), lte(sla_tracking.response_due_at!, sql`NOW()`)];
    if (entity_type) clauses.push(eq(sla_tracking.entity_type, entity_type));
    return db.select().from(sla_tracking).where(and(...clauses)).orderBy(asc(sla_tracking.response_due_at)).limit(100);
  }

  async get_stats() {
    const now = sql`NOW()`;
    const [active, overdue, breached] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(sla_tracking).where(eq(sla_tracking.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(sla_tracking).where(and(eq(sla_tracking.status, "active"), lte(sla_tracking.response_due_at!, now))),
      db.select({ count: sql<number>`count(*)` }).from(sla_tracking).where(and(eq(sla_tracking.status, "breached"), gte(sla_tracking.escalation_count, 3))),
    ]);

    return {
      active: Number(active[0]?.count ?? 0),
      overdue: Number(overdue[0]?.count ?? 0),
      breached: Number(breached[0]?.count ?? 0),
    };
  }

  private async _get(id: string) {
    const [row] = await db.select().from(sla_definitions).where(eq(sla_definitions.id, id)).limit(1);
    return row ?? null;
  }

  private async _get_tracking(id: string) {
    const [row] = await db.select().from(sla_tracking).where(eq(sla_tracking.id, id)).limit(1);
    return row ?? null;
  }

  private async _find_active_tracking(entity_type: string, entity_id: string) {
    const rows = await db
      .select()
      .from(sla_tracking)
      .where(
        and(
          eq(sla_tracking.entity_type, entity_type),
          eq(sla_tracking.entity_id, entity_id),
          sql`${sla_tracking.status} IN ('active', 'awaiting_resolution')`,
        ),
      )
      .orderBy(desc(sla_tracking.created_at))
      .limit(1);
    return rows[0] ?? null;
  }
}

export const sla_engine_service = new SLAEngineService();
