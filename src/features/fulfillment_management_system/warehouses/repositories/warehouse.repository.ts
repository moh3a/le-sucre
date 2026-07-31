import "server-only";

import { and, count, desc, eq, like, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { warehouses } from "../schema";

export class WarehouseRepository {
  async create(input: {
    name: string;
    slug: string;
    location: string | null;
    phone: string | null;
    email: string | null;
  }) {
    const id = generate_id();
    await db.insert(warehouses).values({ id, ...input });
    return this.get_by_id(id)!;
  }

  async get_by_id(id: string) {
    const [row] = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    return row ?? null;
  }

  async get_by_slug(slug: string) {
    const [row] = await db.select().from(warehouses).where(eq(warehouses.slug, slug)).limit(1);
    return row ?? null;
  }

  async update(
    id: string,
    patch: Partial<{
      name: string;
      slug: string;
      location: string | null;
      phone: string | null;
      email: string | null;
      is_active: boolean;
    }>,
  ) {
    await db.update(warehouses).set(patch).where(eq(warehouses.id, id));
    return this.get_by_id(id)!;
  }

  async list(input: { page: number; limit: number; include_inactive: boolean; search?: string }) {
    const offset = (input.page - 1) * input.limit;
    const clauses = [];

    if (!input.include_inactive) clauses.push(eq(warehouses.is_active, true));
    if (input.search) {
      clauses.push(
        or(
          like(warehouses.name, `%${input.search}%`),
          like(warehouses.slug, `%${input.search}%`),
          like(warehouses.location, `%${input.search}%`),
        ),
      );
    }

    const where = clauses.length ? and(...clauses) : undefined;

    const items = await db
      .select()
      .from(warehouses)
      .where(where)
      .orderBy(desc(warehouses.created_at))
      .limit(input.limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(warehouses).where(where);
    const total_records = Number(total ?? 0);

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

  async list_all_active() {
    return db
      .select({ id: warehouses.id, name: warehouses.name, slug: warehouses.slug, is_active: warehouses.is_active })
      .from(warehouses)
      .where(eq(warehouses.is_active, true))
      .orderBy(warehouses.name);
  }
}

export const warehouse_repository = new WarehouseRepository();
