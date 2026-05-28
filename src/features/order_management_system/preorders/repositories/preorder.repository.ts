import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, type DbClient } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { sku_preorder_settings, preorder_allocations, preorder_status_events } from "../schema";
import { PREORDER_ALLOCATION_STATUS } from "../constants/preorder-status";

type Tx = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

export class PreorderRepository {
  get_settings(sku_id: string) {
    return db
      .select()
      .from(sku_preorder_settings)
      .where(eq(sku_preorder_settings.sku_id, sku_id))
      .limit(1)
      .then((r) => r[0] ?? null);
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

  async confirm_allocation(allocation_id: string, order_id: string, order_item_id: string) {
    const [alloc] = await db
      .select()
      .from(preorder_allocations)
      .where(eq(preorder_allocations.id, allocation_id))
      .limit(1);
    if (!alloc) return;

    await db
      .update(preorder_allocations)
      .set({
        status: PREORDER_ALLOCATION_STATUS.confirmed,
        order_id,
        order_item_id,
        updated_at: new Date().toISOString(),
      })
      .where(eq(preorder_allocations.id, allocation_id));

    await db.insert(preorder_status_events).values({
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
          updated_at: new Date().toISOString(),
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
        fulfilled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
          updated_at: new Date().toISOString(),
        },
      });
  }

  admin_list_allocations(page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(preorder_allocations.status, status) : undefined;
    return db
      .select()
      .from(preorder_allocations)
      .where(where)
      .orderBy(sql`${preorder_allocations.created_at} DESC`)
      .limit(limit)
      .offset(offset);
  }

  update_estimated_date(allocation_id: string, estimated_available_at: string) {
    return db
      .update(preorder_allocations)
      .set({ estimated_available_at, updated_at: new Date().toISOString() })
      .where(eq(preorder_allocations.id, allocation_id));
  }
}
export const preorder_repository = new PreorderRepository();
