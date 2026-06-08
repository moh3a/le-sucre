import "server-only";
import { and, asc, desc, eq, inArray, lte, gte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { promotions, promotion_rules } from "../schema";
import { PROMOTION_STATUS, PROMOTION_TYPE } from "../constants/promotion-types";
import { format } from "date-fns";

function now_iso() {
  return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}

export class PromotionRepository {
  async list_admin(page: number, limit: number, status?: string, promotion_type?: string) {
    const offset = (page - 1) * limit;
    const clauses = [];
    if (status) clauses.push(eq(promotions.status, status));
    if (promotion_type) clauses.push(eq(promotions.promotion_type, promotion_type));
    const where = clauses.length ? and(...clauses) : undefined;

    return db
      .select()
      .from(promotions)
      .where(where)
      .orderBy(desc(promotions.created_at))
      .limit(limit)
      .offset(offset);
  }

  async get_by_id(id: string) {
    const [row] = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
    return row ?? null;
  }

  async get_with_rules(id: string) {
    const promo = await this.get_by_id(id);
    if (!promo) return null;
    const rules = await db
      .select()
      .from(promotion_rules)
      .where(and(eq(promotion_rules.promotion_id, id), eq(promotion_rules.is_active, true)))
      .orderBy(asc(promotion_rules.sort_order));
    return { ...promo, rules };
  }

  async list_active_automatic(user_id?: string | null) {
    const now = now_iso();
    const rows = await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.status, PROMOTION_STATUS.active),
          inArray(promotions.promotion_type, [PROMOTION_TYPE.automatic, PROMOTION_TYPE.customer]),
          or(sql`${promotions.starts_at} IS NULL`, lte(promotions.starts_at, now)),
          or(sql`${promotions.ends_at} IS NULL`, gte(promotions.ends_at, now)),
        ),
      )
      .orderBy(asc(promotions.priority));

    const result = [];
    for (const promo of rows) {
      const rules = await db
        .select()
        .from(promotion_rules)
        .where(and(eq(promotion_rules.promotion_id, promo.id), eq(promotion_rules.is_active, true)))
        .orderBy(asc(promotion_rules.sort_order));

      if (promo.promotion_type === PROMOTION_TYPE.customer) {
        const has_user_rule = rules.some(
          (r) => r.scope_type === "customer" && r.scope_id === user_id,
        );
        if (!user_id || !has_user_rule) continue;
      }

      result.push({ ...promo, rules });
    }
    return result;
  }

  async create(input: {
    name: string;
    slug: string;
    description?: string | null;
    promotion_type: string;
    status: string;
    priority: number;
    is_stackable: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    rules: Array<Omit<typeof promotion_rules.$inferInsert, "promotion_id">>;
  }) {
    const id = generate_id();
    await db.insert(promotions).values({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      promotion_type: input.promotion_type,
      status: input.status,
      priority: input.priority,
      is_stackable: input.is_stackable,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
    });

    if (input.rules.length) {
      await db.insert(promotion_rules).values(
        input.rules.map((r, idx) => ({
          id: generate_id(),
          ...r,
          promotion_id: id,
          sort_order: r.sort_order ?? idx,
        })),
      );
    }

    return this.get_with_rules(id);
  }

  async update(
    id: string,
    patch: Partial<typeof promotions.$inferInsert> & {
      rules?: Array<Omit<typeof promotion_rules.$inferInsert, "promotion_id">>;
    },
  ) {
    const { rules, ...promo_patch } = patch;
    if (Object.keys(promo_patch).length) {
      await db.update(promotions).set(promo_patch).where(eq(promotions.id, id));
    }

    if (rules) {
      await db.delete(promotion_rules).where(eq(promotion_rules.promotion_id, id));
      if (rules.length) {
        await db.insert(promotion_rules).values(
          rules.map((r, idx) => ({
            id: generate_id(),
            promotion_id: id,
            ...r,
            sort_order: r.sort_order ?? idx,
          })),
        );
      }
    }

    return this.get_with_rules(id);
  }
}

export const promotion_repository = new PromotionRepository();
