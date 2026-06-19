import "server-only";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { inventory_service } from "@/features/inventory_management_system/inventory/services/inventory.service";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { inventory_adjustment_requests } from "../schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { OPERATIONS_ERROR } from "../constants/error-codes";

export class InventoryAdjustmentService {
  async request_adjustment(input: {
    sku_id: string;
    warehouse_id?: string;
    adjustment_type: string;
    quantity_delta: number;
    current_on_hand: number;
    expected_on_hand: number;
    reason: string;
    requested_by_user_id: string;
  }) {
    const [created] = await db
      .insert(inventory_adjustment_requests)
      .values({
        id: generate_id(),
        sku_id: input.sku_id,
        warehouse_id: input.warehouse_id ?? "default",
        adjustment_type: input.adjustment_type,
        quantity_delta: input.quantity_delta,
        current_on_hand: input.current_on_hand,
        expected_on_hand: input.expected_on_hand,
        reason: input.reason,
        status: "pending",
        requested_by_user_id: input.requested_by_user_id,
      })
      .$returningId();

    void audit_service.log({
      actor_user_id: input.requested_by_user_id,
      action: "inventory.adjustment.request",
      resource_type: "sku_id",
      resource_id: input.sku_id,
      metadata: { adjustment_type: input.adjustment_type, quantity_delta: input.quantity_delta },
    });

    return db
      .select()
      .from(inventory_adjustment_requests)
      .where(eq(inventory_adjustment_requests.id, created.id))
      .then((r) => r[0] ?? null);
  }

  async review(input: {
    id: string;
    status: "approved" | "rejected" | "cancelled";
    review_note?: string;
    reviewed_by_user_id: string;
  }) {
    const req = await db
      .select()
      .from(inventory_adjustment_requests)
      .where(eq(inventory_adjustment_requests.id, input.id))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (!req) throw_error(OPERATIONS_ERROR.INVENTORY_ADJUSTMENT_NOT_FOUND);
    if (req.status !== "pending") throw_error(OPERATIONS_ERROR.INVALID_STATUS);

    await db
      .update(inventory_adjustment_requests)
      .set({
        status: input.status,
        reviewed_by_user_id: input.reviewed_by_user_id,
        review_note: input.review_note ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .where(eq(inventory_adjustment_requests.id, input.id));

    if (input.status === "approved") {
      await inventory_service.adjust_stock({
        sku_id: req.sku_id,
        warehouse_id: req.warehouse_id,
        quantity_delta: req.quantity_delta,
        reference_type: "adjustment_approval",
        reference_id: input.id,
      });
    }

    void audit_service.log({
      actor_user_id: input.reviewed_by_user_id,
      action: "inventory.adjustment.review",
      resource_type: "adjustment_request_id",
      resource_id: input.id,
      metadata: { status: input.status },
    });
  }

  async list(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const where = status ? eq(inventory_adjustment_requests.status, status) : undefined;
    const { count } = await import("drizzle-orm");
    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(inventory_adjustment_requests)
        .where(where)
        .orderBy(inventory_adjustment_requests.created_at)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(inventory_adjustment_requests).where(where),
    ]);
    return {
      items,
      meta: {
        page,
        limit,
        total_records: Number(total ?? 0),
        total_pages: Math.max(1, Math.ceil(Number(total ?? 0) / limit)),
        has_more: page * limit < Number(total ?? 0),
      },
    };
  }

  async stats() {
    const { count } = await import("drizzle-orm");
    const [pending] = await db
      .select({ count: count() })
      .from(inventory_adjustment_requests)
      .where(eq(inventory_adjustment_requests.status, "pending"));
    const [approved] = await db
      .select({ count: count() })
      .from(inventory_adjustment_requests)
      .where(eq(inventory_adjustment_requests.status, "approved"));
    return {
      pending: Number(pending?.count ?? 0),
      approved: Number(approved?.count ?? 0),
    };
  }
}

export const inventory_adjustment_service = new InventoryAdjustmentService();
