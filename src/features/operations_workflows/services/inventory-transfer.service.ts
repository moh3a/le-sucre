import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { inventory_transfers, inventory_transfer_items } from "../schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

let transfer_counter = 1;

function generate_transfer_number(): string {
  const year = new Date().getFullYear();
  const num = String(transfer_counter++).padStart(6, "0");
  return `TFR-${year}-${num}`;
}

export class InventoryTransferService {
  async create(input: {
    source_warehouse_id: string;
    destination_warehouse_id: string;
    reason: string;
    notes?: string;
    items: Array<{ product_id: string; quantity: number }>;
    created_by_user_id: string;
  }) {
    const id = generate_id();
    const transfer_number = generate_transfer_number();

    await db.insert(inventory_transfers).values({
      id,
      transfer_number,
      source_warehouse_id: input.source_warehouse_id,
      destination_warehouse_id: input.destination_warehouse_id,
      status: "draft",
      reason: input.reason,
      notes: input.notes ?? null,
      created_by_user_id: input.created_by_user_id,
    });

    for (const item of input.items) {
      await db.insert(inventory_transfer_items).values({
        id: generate_id(),
        transfer_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }

    void audit_service.log({
      action: "inventory_transfer.created",
      resource_type: "inventory_transfer_id",
      resource_id: id,
      metadata: { transfer_number, source: input.source_warehouse_id, dest: input.destination_warehouse_id },
    });

    return this.get(id);
  }

  async approve(id: string, user_id: string) {
    await db
      .update(inventory_transfers)
      .set({ status: "approved", approved_by_user_id: user_id })
      .where(eq(inventory_transfers.id, id));

    void audit_service.log({
      action: "inventory_transfer.approved",
      resource_type: "inventory_transfer_id",
      resource_id: id,
    });

    return this.get(id);
  }

  async ship(id: string) {
    const transfer = await this._get_transfer(id);
    if (!transfer || transfer.status !== "approved") throw new Error("Transfer must be approved before shipping");

    const items = await this._get_items(id);

    for (const item of items) {
      await db.execute(
        sql`UPDATE inventory_stock SET quantity = quantity - ${item.quantity} WHERE warehouse_id = ${transfer.source_warehouse_id} AND product_id = ${item.product_id}`,
      );
    }

    await db
      .update(inventory_transfers)
      .set({ status: "in_transit", shipped_at: sql`NOW()` })
      .where(eq(inventory_transfers.id, id));

    void audit_service.log({
      action: "inventory_transfer.shipped",
      resource_type: "inventory_transfer_id",
      resource_id: id,
    });

    return this.get(id);
  }

  async receive(id: string) {
    const transfer = await this._get_transfer(id);
    if (!transfer || transfer.status !== "in_transit") throw new Error("Transfer must be in_transit before receiving");

    const items = await this._get_items(id);

    for (const item of items) {
      await db.execute(
        sql`UPDATE inventory_stock SET quantity = quantity + ${item.quantity}, reserved_quantity = reserved_quantity + ${item.quantity} WHERE warehouse_id = ${transfer.destination_warehouse_id} AND product_id = ${item.product_id}`,
      );

      await db
        .update(inventory_transfer_items)
        .set({ received_quantity: item.quantity })
        .where(eq(inventory_transfer_items.id, item.id));
    }

    await db
      .update(inventory_transfers)
      .set({ status: "completed", received_at: sql`NOW()` })
      .where(eq(inventory_transfers.id, id));

    void audit_service.log({
      action: "inventory_transfer.received",
      resource_type: "inventory_transfer_id",
      resource_id: id,
    });

    return this.get(id);
  }

  async cancel(id: string, reason?: string) {
    await db
      .update(inventory_transfers)
      .set({ status: "cancelled", notes: reason ?? null })
      .where(eq(inventory_transfers.id, id));

    void audit_service.log({
      action: "inventory_transfer.cancelled",
      resource_type: "inventory_transfer_id",
      resource_id: id,
    });

    return this.get(id);
  }

  async get(id: string) {
    const transfer = await this._get_transfer(id);
    if (!transfer) return null;
    const items = await this._get_items(id);
    return { ...transfer, items };
  }

  async list(status?: string) {
    const clauses: any[] = [];
    if (status) clauses.push(eq(inventory_transfers.status, status));
    return db
      .select()
      .from(inventory_transfers)
      .where(clauses.length ? and(...clauses) : undefined)
      .orderBy(desc(inventory_transfers.created_at));
  }

  private async _get_transfer(id: string) {
    const [row] = await db.select().from(inventory_transfers).where(eq(inventory_transfers.id, id)).limit(1);
    return row ?? null;
  }

  private async _get_items(transfer_id: string) {
    return db
      .select()
      .from(inventory_transfer_items)
      .where(eq(inventory_transfer_items.transfer_id, transfer_id));
  }
}

export const inventory_transfer_service = new InventoryTransferService();
