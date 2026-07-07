import "server-only";
import { and, asc, count, desc, eq, gte, inArray, lte, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { promotions, promotion_rules, promotion_redemptions, promo_codes } from "../schema";
import { PROMOTION_STATUS, PROMOTION_TYPE } from "../constants/promotion-types";
import { format } from "date-fns";

function now_iso() {
  return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}

export class PromotionRepository {
  async list_admin(page: number, limit: number, status?: string, promotion_type?: string, search?: string) {
    const offset = (page - 1) * limit;
    const clauses = [];
    if (status) clauses.push(eq(promotions.status, status));
    if (promotion_type) clauses.push(eq(promotions.promotion_type, promotion_type));
    if (search) clauses.push(or(like(promotions.name, `%${search}%`), like(promotions.slug, `%${search}%`)));
    const where = clauses.length ? and(...clauses) : undefined;

    const [[{ total }], items] = await Promise.all([
      db.select({ total: count() }).from(promotions).where(where),
      db
        .select({
          id: promotions.id,
          name: promotions.name,
          slug: promotions.slug,
          promotion_type: promotions.promotion_type,
          status: promotions.status,
          priority: promotions.priority,
          is_stackable: promotions.is_stackable,
          starts_at: promotions.starts_at,
          ends_at: promotions.ends_at,
          created_at: promotions.created_at,
          updated_at: promotions.updated_at,
          usage_count: sql<number>`COALESCE(sum(${promotion_redemptions.id}), 0)`.mapWith(Number),
          total_discount: sql<string>`COALESCE(sum(${promotion_redemptions.discount_amount}), 0)`,
          discount_type: sql<string>`MIN(${promotion_rules.discount_type})`,
          discount_value: sql<string>`MIN(${promotion_rules.discount_value})`,
        })
        .from(promotions)
        .leftJoin(promotion_redemptions, eq(promotion_redemptions.promotion_id, promotions.id))
        .leftJoin(promotion_rules, and(eq(promotion_rules.promotion_id, promotions.id), eq(promotion_rules.is_active, true)))
        .where(where)
        .groupBy(promotions.id)
        .orderBy(desc(promotions.created_at))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async stats() {
    const [total, active, draft, scheduled, paused, expired, promoCodeCount, totalRedemptions] = await Promise.all([
      db.select({ count: count() }).from(promotions),
      db.select({ count: count() }).from(promotions).where(eq(promotions.status, "active")),
      db.select({ count: count() }).from(promotions).where(eq(promotions.status, "draft")),
      db.select({ count: count() }).from(promotions).where(eq(promotions.status, "scheduled")),
      db.select({ count: count() }).from(promotions).where(eq(promotions.status, "paused")),
      db.select({ count: count() }).from(promotions).where(eq(promotions.status, "expired")),
      db.select({ count: count() }).from(promo_codes),
      db.select({ count: count(), total: sql<string>`COALESCE(sum(${promotion_redemptions.discount_amount}), 0)` }).from(promotion_redemptions),
    ]);

    return {
      total: total[0].count,
      active: active[0].count,
      draft: draft[0].count,
      scheduled: scheduled[0].count,
      paused: paused[0].count,
      expired: expired[0].count,
      promo_code_count: promoCodeCount[0].count,
      total_redemptions: totalRedemptions[0].count,
      total_discount_amount: totalRedemptions[0].total,
    };
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

  async find_redemptions_by_user_id(user_id: string) {
    return db
      .select({
        id: promotion_redemptions.id,
        promotion_id: promotion_redemptions.promotion_id,
        promo_code_id: promotion_redemptions.promo_code_id,
        order_id: promotion_redemptions.order_id,
        user_id: promotion_redemptions.user_id,
        discount_amount: promotion_redemptions.discount_amount,
        created_at: promotion_redemptions.created_at,
        promotion_name: promotions.name,
        promotion_type: promotions.promotion_type,
        code: promo_codes.code,
      })
      .from(promotion_redemptions)
      .leftJoin(promotions, eq(promotions.id, promotion_redemptions.promotion_id))
      .leftJoin(promo_codes, eq(promo_codes.id, promotion_redemptions.promo_code_id))
      .where(eq(promotion_redemptions.user_id, user_id))
      .orderBy(desc(promotion_redemptions.created_at));
  }

  async list_storefront() {
    const now = now_iso();

    const active_promotions = await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.status, PROMOTION_STATUS.active),
          inArray(promotions.promotion_type, [
            PROMOTION_TYPE.automatic,
            PROMOTION_TYPE.promo_code,
            PROMOTION_TYPE.customer,
          ]),
          or(sql`${promotions.starts_at} IS NULL`, lte(promotions.starts_at, now)),
          or(sql`${promotions.ends_at} IS NULL`, gte(promotions.ends_at, now)),
        ),
      )
      .orderBy(asc(promotions.priority));

    if (!active_promotions.length) return { promotions: [], promo_codes: [] };

    const promotion_ids = active_promotions.map((p) => p.id);

    const [rules, codes] = await Promise.all([
      db
        .select()
        .from(promotion_rules)
        .where(
          and(
            inArray(promotion_rules.promotion_id, promotion_ids),
            eq(promotion_rules.is_active, true),
          ),
        )
        .orderBy(asc(promotion_rules.sort_order)),
      db
        .select()
        .from(promo_codes)
        .where(
          and(
            inArray(promo_codes.promotion_id, promotion_ids),
            eq(promo_codes.is_active, true),
            or(sql`${promo_codes.starts_at} IS NULL`, lte(promo_codes.starts_at, now)),
            or(sql`${promo_codes.ends_at} IS NULL`, gte(promo_codes.ends_at, now)),
          ),
        ),
    ]);

    const rules_by_promotion = new Map<string, typeof rules>();
    for (const rule of rules) {
      const existing = rules_by_promotion.get(rule.promotion_id) ?? [];
      existing.push(rule);
      rules_by_promotion.set(rule.promotion_id, existing);
    }

    const codes_by_promotion = new Map<string, typeof codes>();
    for (const code of codes) {
      const existing = codes_by_promotion.get(code.promotion_id) ?? [];
      existing.push(code);
      codes_by_promotion.set(code.promotion_id, existing);
    }

    const promotions_with_rules = active_promotions.map((p) => ({
      ...p,
      rules: rules_by_promotion.get(p.id) ?? [],
    }));

    return { promotions: promotions_with_rules, promo_codes: codes };
  }
}

export const promotion_repository = new PromotionRepository();
