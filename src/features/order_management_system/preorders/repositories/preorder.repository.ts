import "server-only";

import { and, asc, count, desc, eq, isNull, like, lte, or, sql } from "drizzle-orm";
import { format } from "date-fns";

import { db, type DbClient } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { PREORDER_ERROR } from "../constants/error-codes";
import { sku_preorder_settings, preorder_allocations, preorder_status_events } from "../schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
import { PREORDER_ALLOCATION_STATUS } from "../constants/preorder-status";

type Tx = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

const LOCALE = "fr";

export class PreorderRepository {
  get_settings(sku_id: string, tx?: Tx) {
    const client = tx ?? db;
    return client
      .select()
      .from(sku_preorder_settings)
      .where(eq(sku_preorder_settings.sku_id, sku_id))
      .limit(1)
      .then((r) => r[0] ?? null);
  }

  insert_allocation(
    tx: Tx,
    input: {
      id: string;
      sku_id: string;
      quantity: number;
      cart_id?: string | null;
      user_id?: string | null;
      status: string;
      estimated_available_at: string | null;
      contact_name?: string | null;
      contact_email?: string | null;
      contact_phone?: string | null;
    },
  ) {
    return tx.insert(preorder_allocations).values({
      id: input.id,
      sku_id: input.sku_id,
      quantity: input.quantity,
      cart_id: input.cart_id ?? null,
      user_id: input.user_id ?? null,
      status: input.status,
      estimated_available_at: input.estimated_available_at,
      contact_name: input.contact_name ?? null,
      contact_email: input.contact_email ?? null,
      contact_phone: input.contact_phone ?? null,
    });
  }

  async get_settings_for_update(tx: Tx, sku_id: string) {
    const [row] = await tx
      .select()
      .from(sku_preorder_settings)
      .where(eq(sku_preorder_settings.sku_id, sku_id))
      .for("update")
      .limit(1);
    return row ?? null;
  }

  increment_preorder_sold(tx: Tx, sku_id: string, qty: number) {
    return tx
      .update(sku_preorder_settings)
      .set({ preorder_sold: sql`${sku_preorder_settings.preorder_sold} + ${qty}` })
      .where(eq(sku_preorder_settings.sku_id, sku_id));
  }

  decrement_preorder_sold(tx: Tx, sku_id: string, qty: number) {
    return tx
      .update(sku_preorder_settings)
      .set({
        preorder_sold: sql`GREATEST(0, ${sku_preorder_settings.preorder_sold} - ${qty})`,
      })
      .where(eq(sku_preorder_settings.sku_id, sku_id));
  }

  async confirm_allocation(
    allocation_id: string,
    order_id: string,
    order_item_id: string,
    tx?: Tx,
  ) {
    const client = tx ?? db;
    const [alloc] = await client
      .select()
      .from(preorder_allocations)
      .where(eq(preorder_allocations.id, allocation_id))
      .limit(1);
    if (!alloc) throw_error(PREORDER_ERROR.ALLOCATION_NOT_FOUND);
    if (alloc.status === PREORDER_ALLOCATION_STATUS.cancelled)
      throw_error(PREORDER_ERROR.ALLOCATION_CANCELLED);
    if (alloc.status === PREORDER_ALLOCATION_STATUS.expired)
      throw_error(PREORDER_ERROR.ALLOCATION_EXPIRED);
    if (
      alloc.status === PREORDER_ALLOCATION_STATUS.confirmed ||
      alloc.status === PREORDER_ALLOCATION_STATUS.fulfilled
    )
      throw_error(PREORDER_ERROR.ALLOCATION_ALREADY_CONFIRMED);

    await client
      .update(preorder_allocations)
      .set({
        status: PREORDER_ALLOCATION_STATUS.confirmed,
        order_id,
        order_item_id,
        updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      })
      .where(eq(preorder_allocations.id, allocation_id));

    await client.insert(preorder_status_events).values({
      id: generate_id(),
      allocation_id,
      from_status: alloc.status,
      to_status: PREORDER_ALLOCATION_STATUS.confirmed,
      note: "Confirmé à la commande",
    });
  }

  async cancel_allocation(allocation_id: string) {
    const [alloc] = await db
      .select()
      .from(preorder_allocations)
      .where(eq(preorder_allocations.id, allocation_id))
      .limit(1);
    if (!alloc || alloc.status === PREORDER_ALLOCATION_STATUS.cancelled) return;

    await db.transaction(async (tx) => {
      if (alloc.status === PREORDER_ALLOCATION_STATUS.pending) {
        await this.decrement_preorder_sold(tx, alloc.sku_id, alloc.quantity);
      }
      await tx
        .update(preorder_allocations)
        .set({
          status: PREORDER_ALLOCATION_STATUS.cancelled,
          updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        })
        .where(eq(preorder_allocations.id, allocation_id));

      await tx.insert(preorder_status_events).values({
        id: generate_id(),
        allocation_id,
        from_status: alloc.status,
        to_status: PREORDER_ALLOCATION_STATUS.cancelled,
      });
    });
  }

  async expire_stale_pending(cutoff: string) {
    const rows = await db
      .select({ id: preorder_allocations.id })
      .from(preorder_allocations)
      .where(
        and(
          eq(preorder_allocations.status, PREORDER_ALLOCATION_STATUS.pending),
          isNull(preorder_allocations.cart_id),
          lte(preorder_allocations.created_at, cutoff),
        ),
      )
      .limit(500);
    for (const row of rows) {
      await this.expire_allocation(row.id);
    }
    return rows.length;
  }

  async expire_allocation(allocation_id: string) {
    const [alloc] = await db
      .select()
      .from(preorder_allocations)
      .where(eq(preorder_allocations.id, allocation_id))
      .limit(1);
    if (!alloc || alloc.status !== PREORDER_ALLOCATION_STATUS.pending) return;

    await db.transaction(async (tx) => {
      await this.decrement_preorder_sold(tx, alloc.sku_id, alloc.quantity);
      await tx
        .update(preorder_allocations)
        .set({
          status: PREORDER_ALLOCATION_STATUS.expired,
          updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        })
        .where(eq(preorder_allocations.id, allocation_id));

      await tx.insert(preorder_status_events).values({
        id: generate_id(),
        allocation_id,
        from_status: alloc.status,
        to_status: PREORDER_ALLOCATION_STATUS.expired,
        note: "Expiré automatiquement",
      });
    });
  }

  list_confirmed_fifo(sku_id: string) {
    return db
      .select()
      .from(preorder_allocations)
      .where(
        and(
          eq(preorder_allocations.sku_id, sku_id),
          eq(preorder_allocations.status, PREORDER_ALLOCATION_STATUS.confirmed),
        ),
      )
      .orderBy(asc(preorder_allocations.created_at));
  }

  async mark_fulfilled(allocation_id: string) {
    await db
      .update(preorder_allocations)
      .set({
        status: PREORDER_ALLOCATION_STATUS.fulfilled,
        fulfilled_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      })
      .where(eq(preorder_allocations.id, allocation_id));
  }

  upsert_settings(input: typeof sku_preorder_settings.$inferInsert) {
    return db
      .insert(sku_preorder_settings)
      .values(input)
      .onDuplicateKeyUpdate({
        set: {
          is_preorder_enabled: input.is_preorder_enabled,
          allow_backorder: input.allow_backorder,
          max_preorder_qty: input.max_preorder_qty,
          estimated_available_at: input.estimated_available_at,
          deposit_percent: input.deposit_percent,
          lead_time_days: input.lead_time_days,
          is_active: input.is_active,
          updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        },
      });
  }

  async bulk_upsert_settings(entries: Array<typeof sku_preorder_settings.$inferInsert>) {
    await db.transaction(async (tx) => {
      for (const entry of entries) {
        await tx
          .insert(sku_preorder_settings)
          .values(entry)
          .onDuplicateKeyUpdate({
            set: {
              is_preorder_enabled: entry.is_preorder_enabled,
              allow_backorder: entry.allow_backorder,
              max_preorder_qty: entry.max_preorder_qty,
              estimated_available_at: entry.estimated_available_at,
              deposit_percent: entry.deposit_percent,
              lead_time_days: entry.lead_time_days,
              is_active: entry.is_active,
              updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            },
          });
      }
    });
  }

  list_settings_by_product(product_id: string) {
    return db
      .select({
        sku_id: sku_preorder_settings.sku_id,
        is_preorder_enabled: sku_preorder_settings.is_preorder_enabled,
        allow_backorder: sku_preorder_settings.allow_backorder,
        max_preorder_qty: sku_preorder_settings.max_preorder_qty,
        preorder_sold: sku_preorder_settings.preorder_sold,
        estimated_available_at: sku_preorder_settings.estimated_available_at,
        deposit_percent: sku_preorder_settings.deposit_percent,
        lead_time_days: sku_preorder_settings.lead_time_days,
        is_active: sku_preorder_settings.is_active,
      })
      .from(sku_preorder_settings)
      .innerJoin(product_skus, eq(sku_preorder_settings.sku_id, product_skus.id))
      .where(eq(product_skus.product_id, product_id));
  }

  async list_settings(input: { page: number; limit: number; search?: string }) {
    const offset = (input.page - 1) * input.limit;
    const clauses = [];
    if (input.search) {
      clauses.push(
        or(
          like(sku_preorder_settings.sku_id, `%${input.search}%`),
          like(product_skus.sku_code, `%${input.search}%`),
          like(product_translations.name, `%${input.search}%`),
        ),
      );
    }
    const where = clauses.length ? and(...clauses) : undefined;

    const [total_rows] = await db
      .select({ total: count() })
      .from(sku_preorder_settings)
      .innerJoin(product_skus, eq(sku_preorder_settings.sku_id, product_skus.id))
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, product_skus.product_id),
          eq(product_translations.locale, LOCALE),
        ),
      )
      .where(where);

    const items = await db
      .select({
        sku_id: sku_preorder_settings.sku_id,
        sku_code: product_skus.sku_code,
        product_name: product_translations.name,
        is_preorder_enabled: sku_preorder_settings.is_preorder_enabled,
        allow_backorder: sku_preorder_settings.allow_backorder,
        max_preorder_qty: sku_preorder_settings.max_preorder_qty,
        preorder_sold: sku_preorder_settings.preorder_sold,
        estimated_available_at: sku_preorder_settings.estimated_available_at,
        deposit_percent: sku_preorder_settings.deposit_percent,
        lead_time_days: sku_preorder_settings.lead_time_days,
        is_active: sku_preorder_settings.is_active,
        updated_at: sku_preorder_settings.updated_at,
      })
      .from(sku_preorder_settings)
      .innerJoin(product_skus, eq(sku_preorder_settings.sku_id, product_skus.id))
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, product_skus.product_id),
          eq(product_translations.locale, LOCALE),
        ),
      )
      .where(where)
      .orderBy(desc(sku_preorder_settings.updated_at))
      .limit(input.limit)
      .offset(offset);

    const total_records = Number(total_rows?.total ?? 0);
    return {
      items,
      meta: {
        page: input.page,
        limit: input.limit,
        total_records,
        total_pages: Math.max(1, Math.ceil(total_records / input.limit)),
        has_more: input.page * input.limit < total_records,
      },
    };
  }

  async admin_list_allocations(
    page: number,
    limit: number,
    status?: string,
    search?: string,
    sku_id?: string,
  ) {
    const offset = (page - 1) * limit;
    const clauses = [];

    if (status) clauses.push(eq(preorder_allocations.status, status));
    if (sku_id) clauses.push(eq(preorder_allocations.sku_id, sku_id));
    if (search) {
      clauses.push(
        or(
          like(preorder_allocations.id, `%${search}%`),
          like(product_skus.sku_code, `%${search}%`),
          like(product_translations.name, `%${search}%`),
        ),
      );
    }

    const where = clauses.length ? and(...clauses) : undefined;

    const [[{ total }], items] = await Promise.all([
      db
        .select({ total: count() })
        .from(preorder_allocations)
        .leftJoin(product_skus, eq(preorder_allocations.sku_id, product_skus.id))
        .leftJoin(
          product_translations,
          and(
            eq(product_translations.product_id, product_skus.product_id),
            eq(product_translations.locale, LOCALE),
          ),
        )
        .where(where),
      db
        .select({
          id: preorder_allocations.id,
          sku_id: preorder_allocations.sku_id,
          sku_code: product_skus.sku_code,
          product_name: product_translations.name,
          warehouse_id: preorder_allocations.warehouse_id,
          order_id: preorder_allocations.order_id,
          cart_id: preorder_allocations.cart_id,
          order_item_id: preorder_allocations.order_item_id,
          quantity: preorder_allocations.quantity,
          status: preorder_allocations.status,
          estimated_available_at: preorder_allocations.estimated_available_at,
          fulfilled_at: preorder_allocations.fulfilled_at,
          created_at: preorder_allocations.created_at,
          updated_at: preorder_allocations.updated_at,
        })
        .from(preorder_allocations)
        .leftJoin(product_skus, eq(preorder_allocations.sku_id, product_skus.id))
        .leftJoin(
          product_translations,
          and(
            eq(product_translations.product_id, product_skus.product_id),
            eq(product_translations.locale, LOCALE),
          ),
        )
        .where(where)
        .orderBy(sql`${preorder_allocations.created_at} DESC`)
        .limit(limit)
        .offset(offset),
    ]);

    return {
      items,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async stats() {
    const [total, pending, confirmed, fulfilled, cancelled, expired] = await Promise.all([
      db.select({ count: count() }).from(preorder_allocations),
      db
        .select({ count: count() })
        .from(preorder_allocations)
        .where(eq(preorder_allocations.status, "pending")),
      db
        .select({ count: count() })
        .from(preorder_allocations)
        .where(eq(preorder_allocations.status, "confirmed")),
      db
        .select({ count: count() })
        .from(preorder_allocations)
        .where(eq(preorder_allocations.status, "fulfilled")),
      db
        .select({ count: count() })
        .from(preorder_allocations)
        .where(eq(preorder_allocations.status, "cancelled")),
      db
        .select({ count: count() })
        .from(preorder_allocations)
        .where(eq(preorder_allocations.status, "expired")),
    ]);

    const [{ total_qty }] = await db
      .select({
        total_qty: sql<number>`COALESCE(SUM(${preorder_allocations.quantity}), 0)`.mapWith(Number),
      })
      .from(preorder_allocations)
      .where(
        or(
          eq(preorder_allocations.status, "pending"),
          eq(preorder_allocations.status, "confirmed"),
        ),
      );

    return {
      total: total[0].count,
      pending: pending[0].count,
      confirmed: confirmed[0].count,
      fulfilled: fulfilled[0].count,
      cancelled: cancelled[0].count,
      expired: expired[0].count,
      total_qty_active: total_qty,
    };
  }

  update_estimated_date(allocation_id: string, estimated_available_at: string) {
    return db
      .update(preorder_allocations)
      .set({ estimated_available_at, updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") })
      .where(eq(preorder_allocations.id, allocation_id));
  }

  async export_csv(input: { search?: string; status?: string }) {
    const { items } = await this.admin_list_allocations(1, 100_000, input.status, input.search);
    const escape = (value: string | number | null | undefined) => {
      const v = String(value ?? "");
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const header = [
      "id",
      "sku_id",
      "sku_code",
      "product_name",
      "warehouse_id",
      "order_id",
      "cart_id",
      "order_item_id",
      "quantity",
      "status",
      "estimated_available_at",
      "fulfilled_at",
      "created_at",
      "updated_at",
    ];
    const rows = items.map((i) =>
      [
        i.id,
        i.sku_id,
        i.sku_code,
        i.product_name,
        i.warehouse_id,
        i.order_id,
        i.cart_id,
        i.order_item_id,
        i.quantity,
        i.status,
        i.estimated_available_at,
        i.fulfilled_at,
        i.created_at,
        i.updated_at,
      ]
        .map(escape)
        .join(","),
    );
    return [header.join(","), ...rows].join("\n");
  }
}
export const preorder_repository = new PreorderRepository();
