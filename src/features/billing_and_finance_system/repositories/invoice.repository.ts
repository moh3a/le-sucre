import "server-only";

import { and, count, desc, eq, like, or, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, invoice_items } from "../db/schema";
import { orders } from "@/features/order_management_system/orders/schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import type { Invoice, NewInvoice, NewInvoiceItem } from "../types";

export class InvoiceRepository {
  async find_by_id(id: string) {
    const row = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!row) return null;

    const items = await db.select().from(invoice_items).where(eq(invoice_items.invoice_id, id));

    return { ...row, items };
  }

  async find_by_number(invoice_number: string) {
    const row = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoice_number, invoice_number))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!row) return null;

    const items = await db.select().from(invoice_items).where(eq(invoice_items.invoice_id, row.id));

    return { ...row, items };
  }

  async find_by_order_id(order_id: string) {
    return await db.select().from(invoices).where(eq(invoices.order_id, order_id));
  }

  async create_invoice(invoice_data: NewInvoice, items_data: NewInvoiceItem[]) {
    return await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(invoices).values(invoice_data).$returningId();
      const invoice_id = inserted.id;

      if (items_data.length > 0) {
        const items_with_id = items_data.map((item) => ({
          ...item,
          invoice_id,
        }));
        await tx.insert(invoice_items).values(items_with_id);
      }

      return invoice_id;
    });
  }

  async list_customer_invoices(user_id: string, page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const conds = [eq(invoices.user_id, user_id)];
    if (status) {
      conds.push(eq(invoices.status, status));
    }

    const where_clause = and(...conds);

    const [items, [{ total }]] = await Promise.all([
      db
        .select()
        .from(invoices)
        .where(where_clause)
        .orderBy(desc(invoices.created_at))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(invoices).where(where_clause),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.ceil(total_records / limit) || 1;

    return {
      items,
      meta: {
        page,
        limit,
        total_records,
        total_pages,
        has_more: page < total_pages,
      },
    };
  }

  async list_admin_invoices(params: {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    order_id?: string;
    search?: string;
  }) {
    const { page, limit, status, type, order_id, search } = params;
    const offset = (page - 1) * limit;
    const conds = [];

    if (status) conds.push(eq(invoices.status, status));
    if (type) conds.push(eq(invoices.type, type));
    if (order_id) conds.push(eq(invoices.order_id, order_id));

    if (search) {
      conds.push(
        or(
          like(invoices.invoice_number, `%${search}%`),
          like(invoices.order_id, `%${search}%`),
          like(users.name, `%${search}%`),
        ),
      );
    }

    const where_clause = conds.length ? and(...conds) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db
        .select({
          invoice: invoices,
          customer_name: users.name,
          customer_email: users.email,
          order_number: orders.order_number,
        })
        .from(invoices)
        .leftJoin(users, eq(users.id, invoices.user_id))
        .leftJoin(orders, eq(orders.id, invoices.order_id))
        .where(where_clause)
        .orderBy(desc(invoices.created_at))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(invoices)
        .leftJoin(users, eq(users.id, invoices.user_id))
        .leftJoin(orders, eq(orders.id, invoices.order_id))
        .where(where_clause),
    ]);

    const total_records = Number(total ?? 0);
    const total_pages = Math.ceil(total_records / limit) || 1;

    return {
      items: items.map((i) => ({
        ...i.invoice,
        customer_name: i.customer_name ?? "Guest",
        customer_email: i.customer_email ?? "N/A",
        order_number: i.order_number ?? "N/A",
      })),
      meta: {
        page,
        limit,
        total_records,
        total_pages,
        has_more: page < total_pages,
      },
    };
  }

  async update_status(id: string, status: string, paid_at?: string) {
    const update_data: Partial<Invoice> = { status };
    if (paid_at) {
      update_data.paid_at = paid_at;
    }
    return await db.update(invoices).set(update_data).where(eq(invoices.id, id));
  }

  async get_financial_summary(start_date?: string, end_date?: string) {
    const conds = [];
    if (start_date) {
      conds.push(sql`${invoices.created_at} >= ${start_date}`);
    }
    if (end_date) {
      conds.push(sql`${invoices.created_at} <= ${end_date}`);
    }

    const where_clause = conds.length ? and(...conds) : undefined;

    // Daily breakdown for revenue growth
    const daily_breakdown = await db
      .select({
        day: invoices.created_at,
        revenue: sum(invoices.grand_total),
        tax: sum(invoices.tax_total),
        count: count(invoices.id),
      })
      .from(invoices)
      .where(and(where_clause, eq(invoices.status, "paid")))
      .groupBy(invoices.created_at)
      .orderBy(invoices.created_at);

    // Status aggregates
    const status_aggregates = await db
      .select({
        status: invoices.status,
        count: count(invoices.id),
        total_amount: sum(invoices.grand_total),
      })
      .from(invoices)
      .where(where_clause)
      .groupBy(invoices.status);

    // Document type aggregates
    const type_aggregates = await db
      .select({
        type: invoices.type,
        count: count(invoices.id),
        total_amount: sum(invoices.grand_total),
      })
      .from(invoices)
      .where(where_clause)
      .groupBy(invoices.type);

    return {
      daily_breakdown: daily_breakdown.map((row) => ({
        day: row.day,
        revenue: Number(row.revenue ?? 0),
        tax: Number(row.tax ?? 0),
        count: Number(row.count ?? 0),
      })),
      status_aggregates: status_aggregates.map((row) => ({
        status: row.status,
        count: Number(row.count ?? 0),
        total_amount: Number(row.total_amount ?? 0),
      })),
      type_aggregates: type_aggregates.map((row) => ({
        type: row.type,
        count: Number(row.count ?? 0),
        total_amount: Number(row.total_amount ?? 0),
      })),
    };
  }
}

export const invoice_repository = new InvoiceRepository();
