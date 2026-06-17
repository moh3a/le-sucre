import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";

import { product_properties, property_values } from "../schema";

export class PropertyRepository {
  async list_properties(product_id: string) {
    return db
      .select()
      .from(product_properties)
      .where(eq(product_properties.product_id, product_id))
      .orderBy(asc(product_properties.sort_order), asc(product_properties.name));
  }

  async list_values(property_id: string) {
    return db
      .select()
      .from(property_values)
      .where(eq(property_values.property_id, property_id))
      .orderBy(asc(property_values.sort_order), asc(property_values.label));
  }

  async get_property(id: string) {
    const [row] = await db
      .select()
      .from(product_properties)
      .where(eq(product_properties.id, id))
      .limit(1);
    return row ?? null;
  }

  async get_value(id: string) {
    const [row] = await db
      .select()
      .from(property_values)
      .where(eq(property_values.id, id))
      .limit(1);
    return row ?? null;
  }

  async create_property(input: {
    product_id: string;
    code: string;
    name: string;
    sort_order: number;
    is_required: boolean;
  }) {
    const existing = await db
      .select()
      .from(product_properties)
      .where(
        and(
          eq(product_properties.product_id, input.product_id),
          eq(product_properties.code, input.code),
        ),
      )
      .limit(1);

    if (existing.length)
      throw new ConflictError("Ce code de propriété existe déjà pour ce produit");

    const id = generate_id();
    await db.insert(product_properties).values({
      id,
      product_id: input.product_id,
      code: input.code,
      name: input.name,
      sort_order: input.sort_order,
      is_required: input.is_required,
    });

    return this.get_property(id);
  }

  async update_property(
    id: string,
    input: Partial<{ code: string; name: string; sort_order: number; is_required: boolean }>,
  ) {
    const current = await this.get_property(id);
    if (!current) throw new NotFoundError("Propriété introuvable");

    if (input.code && input.code !== current.code) {
      const conflict = await db
        .select()
        .from(product_properties)
        .where(
          and(
            eq(product_properties.product_id, current.product_id),
            eq(product_properties.code, input.code),
          ),
        )
        .limit(1);
      if (conflict.length)
        throw new ConflictError("Ce code de propriété existe déjà pour ce produit");
    }

    await db
      .update(product_properties)
      .set({
        ...(input.code !== undefined && { code: input.code }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
        ...(input.is_required !== undefined && { is_required: input.is_required }),
      })
      .where(eq(product_properties.id, id));

    return this.get_property(id);
  }

  async delete_property(id: string) {
    const current = await this.get_property(id);
    if (!current) throw new NotFoundError("Propriété introuvable");
    await db.delete(product_properties).where(eq(product_properties.id, id));
    return { ok: true };
  }

  async create_value(input: {
    property_id: string;
    code: string;
    label: string;
    sort_order: number;
    thumbnail_image?: string | null;
    color_hex?: string | null;
    metadata: Record<string, unknown>;
  }) {
    const existing = await db
      .select()
      .from(property_values)
      .where(
        and(
          eq(property_values.property_id, input.property_id),
          eq(property_values.code, input.code),
        ),
      )
      .limit(1);

    if (existing.length)
      throw new ConflictError("Ce code de valeur existe déjà pour cette propriété");

    const id = generate_id();
    await db.insert(property_values).values({
      id,
      property_id: input.property_id,
      code: input.code,
      label: input.label,
      sort_order: input.sort_order,
      thumbnail_image: input.thumbnail_image ?? null,
      color_hex: input.color_hex ?? null,
      metadata: input.metadata,
    });

    return this.get_value(id);
  }

  async update_value(
    id: string,
    input: Partial<{
      code: string;
      label: string;
      sort_order: number;
      thumbnail_image: string | null;
      color_hex: string | null;
      metadata: Record<string, unknown>;
    }>,
  ) {
    const current = await this.get_value(id);
    if (!current) throw new NotFoundError("Valeur introuvable");

    if (input.code && input.code !== current.code) {
      const conflict = await db
        .select()
        .from(property_values)
        .where(
          and(
            eq(property_values.property_id, current.property_id),
            eq(property_values.code, input.code),
          ),
        )
        .limit(1);
      if (conflict.length)
        throw new ConflictError("Ce code de valeur existe déjà pour cette propriété");
    }

    await db
      .update(property_values)
      .set({
        ...(input.code !== undefined && { code: input.code }),
        ...(input.label !== undefined && { label: input.label }),
        ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
        ...(input.thumbnail_image !== undefined && { thumbnail_image: input.thumbnail_image }),
        ...(input.color_hex !== undefined && { color_hex: input.color_hex }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
      })
      .where(eq(property_values.id, id));

    return this.get_value(id);
  }

  async delete_value(id: string) {
    const current = await this.get_value(id);
    if (!current) throw new NotFoundError("Valeur introuvable");
    await db.delete(property_values).where(eq(property_values.id, id));
    return { ok: true };
  }

  async get_values_by_ids(ids: string[]) {
    if (!ids.length) return [];
    return db.select().from(property_values).where(inArray(property_values.id, ids));
  }
}

export const property_repository = new PropertyRepository();
