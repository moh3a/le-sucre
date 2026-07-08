import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc, desc, sql, type SQL } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { suppliers, supplier_products, purchase_orders, purchase_order_items } from "../schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

let po_counter = 1;

function generate_po_number(): string {
  const year = new Date().getFullYear();
  const num = String(po_counter++).padStart(6, "0");
  return `PO-${year}-${num}`;
}

export class ProcurementService {
  // ─── Suppliers ──────────────────────────────────────────────────────────

  async create_supplier(input: {
    name: string;
    code: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    payment_terms?: string;
    currency?: string;
  }) {
    const id = generate_id();
    await db.insert(suppliers).values({ id, ...input, currency: input.currency ?? "DZD" });
    return this.get_supplier(id);
  }

  async get_supplier(id: string) {
    const [row] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return row ?? null;
  }

  async list_suppliers() {
    return db.select().from(suppliers).orderBy(asc(suppliers.name));
  }

  async update_supplier(id: string, patch: Partial<typeof suppliers.$inferInsert>) {
    await db.update(suppliers).set(patch).where(eq(suppliers.id, id));
    return this.get_supplier(id);
  }

  // ─── Supplier Products ──────────────────────────────────────────────────

  async link_product(input: { supplier_id: string; product_id: string; unit_cost: number; supplier_sku?: string; lead_time_days?: number; min_order_qty?: number; is_preferred?: boolean }) {
    const id = generate_id();
    await db.insert(supplier_products).values({ id, ...input, unit_cost: String(input.unit_cost) });
    return this._get_supplier_product(id);
  }

  async get_supplier_products(supplier_id: string) {
    return db
      .select()
      .from(supplier_products)
      .where(eq(supplier_products.supplier_id, supplier_id))
      .orderBy(asc(supplier_products.is_preferred));
  }

  // ─── Purchase Orders ────────────────────────────────────────────────────

  async create_po(input: {
    supplier_id: string;
    warehouse_id?: string;
    items: Array<{ product_id: string; quantity: number; unit_cost: number }>;
    notes?: string;
    expected_delivery_at?: string;
    created_by_user_id: string;
  }) {
    const subtotal = input.items.reduce((s, i) => s + i.unit_cost * i.quantity, 0);
    const po_number = generate_po_number();

    const po_id = generate_id();
    await db.insert(purchase_orders).values({
      id: po_id,
      po_number,
      supplier_id: input.supplier_id,
      warehouse_id: input.warehouse_id ?? null,
      status: "draft",
      subtotal: String(subtotal),
      tax: "0",
      total: String(subtotal),
      notes: input.notes ?? null,
      expected_delivery_at: input.expected_delivery_at ?? null,
      created_by_user_id: input.created_by_user_id,
    });

    for (const item of input.items) {
      await db.insert(purchase_order_items).values({
        id: generate_id(),
        po_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: String(item.unit_cost),
        total_cost: String(item.unit_cost * item.quantity),
      });
    }

    void audit_service.log({
      action: "purchase_order.created",
      resource_type: "purchase_order_id",
      resource_id: po_id,
      metadata: { po_number, supplier_id: input.supplier_id },
    });

    return this.get_po(po_id);
  }

  async submit_po(id: string) {
    await db.update(purchase_orders).set({ status: "submitted" }).where(eq(purchase_orders.id, id));
    void audit_service.log({ action: "purchase_order.submitted", resource_type: "purchase_order_id", resource_id: id });
    return this.get_po(id);
  }

  async approve_po(id: string, user_id: string) {
    await db
      .update(purchase_orders)
      .set({ status: "approved", approved_by_user_id: user_id, approved_at: sql`NOW()` })
      .where(eq(purchase_orders.id, id));
    void audit_service.log({ action: "purchase_order.approved", resource_type: "purchase_order_id", resource_id: id });
    return this.get_po(id);
  }

  async receive_po(id: string, received_items: Array<{ item_id: string; received_qty: number }>) {
    for (const ri of received_items) {
      await db
        .update(purchase_order_items)
        .set({
          received_quantity: sql`${purchase_order_items.received_quantity} + ${ri.received_qty}`,
        })
        .where(eq(purchase_order_items.id, ri.item_id));
    }

    const items = await db.select().from(purchase_order_items).where(eq(purchase_order_items.po_id, id));
    const all_received = items.every((i) => i.received_quantity >= i.quantity);

    if (all_received) {
      await db
        .update(purchase_orders)
        .set({ status: "received", delivered_at: sql`NOW()` })
        .where(eq(purchase_orders.id, id));
    } else {
      await db
        .update(purchase_orders)
        .set({ status: "partially_received" })
        .where(eq(purchase_orders.id, id));
    }

    void audit_service.log({ action: "purchase_order.received", resource_type: "purchase_order_id", resource_id: id });
    return this.get_po(id);
  }

  async get_po(id: string) {
    const [po] = await db.select().from(purchase_orders).where(eq(purchase_orders.id, id)).limit(1);
    if (!po) return null;
    const items = await db
      .select()
      .from(purchase_order_items)
      .where(eq(purchase_order_items.po_id, id));
    return { ...po, items };
  }

  async list_pos(status?: string) {
    const clauses: SQL[] = [];
    if (status) clauses.push(eq(purchase_orders.status, status));
    return db
      .select()
      .from(purchase_orders)
      .where(clauses.length ? and(...clauses) : undefined)
      .orderBy(desc(purchase_orders.created_at));
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private async _get_supplier_product(id: string) {
    const [row] = await db.select().from(supplier_products).where(eq(supplier_products.id, id)).limit(1);
    return row ?? null;
  }
}

export const procurement_service = new ProcurementService();
