import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { rma_records } from "../schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

let rma_counter = 1;

function generate_rma_number(): string {
  const year = new Date().getFullYear();
  const num = String(rma_counter++).padStart(6, "0");
  return `RMA-${year}-${num}`;
}

export class RMAService {
  async issue(input: {
    order_id: string;
    return_request_id?: string;
    created_by_user_id: string;
    carrier?: string;
    tracking_number?: string;
  }) {
    const id = generate_id();
    const rma_number = generate_rma_number();

    await db.insert(rma_records).values({
      id,
      rma_number,
      order_id: input.order_id,
      return_request_id: input.return_request_id ?? null,
      status: "issued",
      carrier: input.carrier ?? null,
      tracking_number: input.tracking_number ?? null,
      created_by_user_id: input.created_by_user_id,
    });

    void audit_service.log({
      action: "rma.issued",
      resource_type: "rma_id",
      resource_id: id,
      metadata: { rma_number, order_id: input.order_id },
    });

    return this.get(id);
  }

  async generate_label(id: string, label_url: string) {
    await db
      .update(rma_records)
      .set({ return_label_url: label_url, status: "label_generated" })
      .where(eq(rma_records.id, id));

    void audit_service.log({
      action: "rma.label_generated",
      resource_type: "rma_id",
      resource_id: id,
    });

    return this.get(id);
  }

  async mark_received(id: string, user_id: string) {
    await db
      .update(rma_records)
      .set({ status: "received", received_at: sql`NOW()` })
      .where(eq(rma_records.id, id));

    void audit_service.log({
      action: "rma.received",
      resource_type: "rma_id",
      resource_id: id,
    });

    return this.get(id);
  }

  async inspect(input: {
    id: string;
    user_id: string;
    inspection_notes: string;
    disposition: string;
  }) {
    await db
      .update(rma_records)
      .set({
        status: "inspected",
        inspected_by_user_id: input.user_id,
        inspection_notes: input.inspection_notes,
        disposition: input.disposition,
      })
      .where(eq(rma_records.id, input.id));

    void audit_service.log({
      action: "rma.inspected",
      resource_type: "rma_id",
      resource_id: input.id,
      metadata: { disposition: input.disposition },
    });

    return this.get(input.id);
  }

  async complete(id: string) {
    await db
      .update(rma_records)
      .set({ status: "completed" })
      .where(eq(rma_records.id, id));

    void audit_service.log({
      action: "rma.completed",
      resource_type: "rma_id",
      resource_id: id,
    });

    return this.get(id);
  }

  async get(id: string) {
    const [row] = await db.select().from(rma_records).where(eq(rma_records.id, id)).limit(1);
    return row ?? null;
  }

  async get_by_order(order_id: string) {
    return db
      .select()
      .from(rma_records)
      .where(eq(rma_records.order_id, order_id))
      .orderBy(desc(rma_records.created_at));
  }

  async list(status?: string) {
    const clauses: any[] = [];
    if (status) clauses.push(eq(rma_records.status, status));
    return db
      .select()
      .from(rma_records)
      .where(clauses.length ? and(...clauses) : undefined)
      .orderBy(desc(rma_records.created_at));
  }
}

export const rma_service = new RMAService();
