import "server-only";
import { and, avg, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { orders, order_items } from "@/features/order_management_system/orders/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
import {
  product_reviews,
  product_review_helpful_votes,
  product_review_reports,
  product_review_moderation_events,
} from "../schema";
import { build_public_review_filters } from "../engines/review-filter.engine";
import { review_order_by } from "../engines/review-sort.engine";
import { format, subDays } from "date-fns";

export class ReviewRepository {
  find_by_id(id: string) {
    return db
      .select()
      .from(product_reviews)
      .where(eq(product_reviews.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  async list_public(input: {
    product_id: string;
    page: number;
    limit: number;
    sort: string;
    rating?: number;
    verified_only?: boolean;
  }) {
    const where = build_public_review_filters(input);
    const offset = (input.page - 1) * input.limit;

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          id: product_reviews.id,
          product_id: product_reviews.product_id,
          user_id: product_reviews.user_id,
          rating: product_reviews.rating,
          title: product_reviews.title,
          body: product_reviews.body,
          is_verified_purchase: product_reviews.is_verified_purchase,
          helpful_count: product_reviews.helpful_count,
          created_at: product_reviews.created_at,
          author_name: users.name,
        })
        .from(product_reviews)
        .innerJoin(users, eq(users.id, product_reviews.user_id))
        .where(where)
        .orderBy(...review_order_by(input.sort))
        .limit(input.limit)
        .offset(offset),
      db.select({ total: count() }).from(product_reviews).where(where),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.max(1, Math.ceil(total_records / input.limit));
    return {
      items,
      meta: {
        page: input.page,
        limit: input.limit,
        total_records,
        total_pages,
        has_more: input.page < total_pages,
      },
    };
  }

  create(input: typeof product_reviews.$inferInsert) {
    return db.insert(product_reviews).values(input);
  }

  update(id: string, patch: Partial<typeof product_reviews.$inferInsert>) {
    return db.update(product_reviews).set(patch).where(eq(product_reviews.id, id));
  }

  async has_user_reviewed_product(user_id: string, product_id: string) {
    const row = await db
      .select({ id: product_reviews.id })
      .from(product_reviews)
      .where(and(eq(product_reviews.user_id, user_id), eq(product_reviews.product_id, product_id)))
      .limit(1);
    return Boolean(row[0]);
  }

  async has_verified_purchase(user_id: string, product_id: string, order_id?: string) {
    const clauses = [
      eq(orders.user_id, user_id),
      eq(order_items.product_id, product_id),
      eq(orders.payment_status, "paid"),
    ];
    if (order_id) clauses.push(eq(orders.id, order_id));

    const row = await db
      .select({ order_item_id: order_items.id, order_id: orders.id })
      .from(order_items)
      .innerJoin(orders, eq(orders.id, order_items.order_id))
      .where(and(...clauses))
      .limit(1);

    return row[0] ?? null;
  }

  async list_by_user(user_id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(product_reviews)
        .where(eq(product_reviews.user_id, user_id))
        .orderBy(desc(product_reviews.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(product_reviews)
        .where(eq(product_reviews.user_id, user_id)),
    ]);
    const total_records = Number(total ?? 0);
    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / limit)),
        has_more: page < Math.ceil(total_records / limit),
      },
    };
  }

  async list_by_user_all(user_id: string) {
    return db
      .select()
      .from(product_reviews)
      .where(eq(product_reviews.user_id, user_id))
      .orderBy(desc(product_reviews.created_at));
  }

  async admin_list(page: number, limit: number, status?: string, product_id?: string) {
    const offset = (page - 1) * limit;
    const filters = [];
    if (status) filters.push(eq(product_reviews.status, status));
    if (product_id) filters.push(eq(product_reviews.product_id, product_id));
    const where = filters.length ? and(...filters) : undefined;

    const [total_res] = await db
      .select({ total: count() })
      .from(product_reviews)
      .where(where);
    const total_records = Number(total_res?.total ?? 0);

    const items = await db
      .select({
        id: product_reviews.id,
        product_id: product_reviews.product_id,
        user_id: product_reviews.user_id,
        rating: product_reviews.rating,
        title: product_reviews.title,
        body: product_reviews.body,
        status: product_reviews.status,
        moderation_note: product_reviews.moderation_note,
        is_verified_purchase: product_reviews.is_verified_purchase,
        locale: product_reviews.locale,
        helpful_count: product_reviews.helpful_count,
        report_count: product_reviews.report_count,
        created_at: product_reviews.created_at,
        updated_at: product_reviews.updated_at,
        author_name: users.name,
        author_email: users.email,
        product_name: product_translations.name,
      })
      .from(product_reviews)
      .leftJoin(users, eq(users.id, product_reviews.user_id))
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, product_reviews.product_id),
          eq(product_translations.locale, "fr"),
        ),
      )
      .where(where)
      .orderBy(desc(product_reviews.created_at))
      .limit(limit)
      .offset(offset);

    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / limit)),
        has_more: page < Math.ceil(total_records / limit),
      },
    };
  }

  insert_moderation_event(input: typeof product_review_moderation_events.$inferInsert) {
    return db.insert(product_review_moderation_events).values(input);
  }

  add_helpful_vote(review_id: string, user_id: string) {
    return db.insert(product_review_helpful_votes).values({ review_id, user_id });
  }

  create_report(input: typeof product_review_reports.$inferInsert) {
    return db.insert(product_review_reports).values(input);
  }

  async stats() {
    const [totals] = await db
      .select({
        total: count(),
        pending:
          sql<number>`SUM(CASE WHEN ${product_reviews.status} = 'pending' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        approved:
          sql<number>`SUM(CASE WHEN ${product_reviews.status} = 'approved' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        rejected:
          sql<number>`SUM(CASE WHEN ${product_reviews.status} = 'rejected' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        verified:
          sql<number>`SUM(CASE WHEN ${product_reviews.is_verified_purchase} = 1 THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        reported:
          sql<number>`SUM(CASE WHEN ${product_reviews.report_count} > 0 THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        average_rating: avg(product_reviews.rating),
      })
      .from(product_reviews);

    const by_rating = await db
      .select({
        rating: product_reviews.rating,
        count: count(),
      })
      .from(product_reviews)
      .where(eq(product_reviews.status, "approved"))
      .groupBy(product_reviews.rating)
      .orderBy(product_reviews.rating);

    return {
      total: Number(totals?.total ?? 0),
      pending: Number(totals?.pending ?? 0),
      approved: Number(totals?.approved ?? 0),
      rejected: Number(totals?.rejected ?? 0),
      verified: Number(totals?.verified ?? 0),
      reported: Number(totals?.reported ?? 0),
      average_rating: Number(totals?.average_rating ?? 0).toFixed(1),
    };
  }

  async rating_trends(days = 30) {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");
    return db
      .select({
        day_key: sql<string>`DATE(${product_reviews.created_at})`,
        count: count(),
        average_rating: avg(product_reviews.rating),
      })
      .from(product_reviews)
      .where(and(eq(product_reviews.status, "approved"), gte(product_reviews.created_at, since)))
      .groupBy(sql`DATE(${product_reviews.created_at})`)
      .orderBy(sql`DATE(${product_reviews.created_at})`);
  }
}

export const review_repository = new ReviewRepository();
