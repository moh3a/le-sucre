import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { VARIANT_ERROR } from "../constants/error-codes";
import { products } from "@/features/product_information_management/products/schema";

import type {
  create_property_dto,
  update_property_dto,
  create_property_value_dto,
  update_property_value_dto,
} from "../models/variant.dto";
import { property_repository } from "../repositories/property.repository";

export class VariantService {
  constructor(private readonly properties = property_repository) {}

  private async assert_product(product_id: string) {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, product_id))
      .limit(1)
      .then((r) => r[0] ?? null);
    if (!product) throw_error(VARIANT_ERROR.PRODUCT_NOT_FOUND);
    return product;
  }

  async get_variant_config(product_id: string) {
    await this.assert_product(product_id);

    const props = await this.properties.list_properties(product_id);
    const properties = await Promise.all(
      props.map(async (p) => ({
        ...p,
        values: await this.properties.list_values(p.id),
      })),
    );

    return { product_id, properties };
  }

  async enable_variants(product_id: string) {
    await this.assert_product(product_id);
    await db.update(products).set({ has_variants: true }).where(eq(products.id, product_id));
    return { ok: true };
  }

  async create_property(input: z.infer<typeof create_property_dto>) {
    await this.assert_product(input.product_id);
    const row = await this.properties.create_property(input);
    await this.enable_variants(input.product_id);
    return row;
  }

  async update_property(input: z.infer<typeof update_property_dto>) {
    const current = await this.properties.get_property(input.id);
    if (!current) throw_error(VARIANT_ERROR.NOT_FOUND);
    return this.properties.update_property(input.id, input);
  }

  async delete_property(id: string) {
    return this.properties.delete_property(id);
  }

  async create_property_value(input: z.infer<typeof create_property_value_dto>) {
    const property = await this.properties.get_property(input.property_id);
    if (!property) throw_error(VARIANT_ERROR.NOT_FOUND);
    return this.properties.create_value({
      property_id: input.property_id,
      code: input.code,
      label: input.label,
      sort_order: input.sort_order,
      thumbnail_image: input.thumbnail_image ?? null,
      color_hex: input.color_hex ?? null,
      metadata: input.metadata ?? {},
    });
  }

  async update_property_value(input: z.infer<typeof update_property_value_dto>) {
    return this.properties.update_value(input.id, {
      ...(input.code !== undefined && { code: input.code }),
      ...(input.label !== undefined && { label: input.label }),
      ...(input.sort_order !== undefined && { sort_order: input.sort_order }),
      ...(input.thumbnail_image !== undefined && { thumbnail_image: input.thumbnail_image }),
      ...(input.color_hex !== undefined && { color_hex: input.color_hex }),
      ...(input.metadata !== undefined && { metadata: input.metadata }),
    });
  }

  async delete_property_value(id: string) {
    return this.properties.delete_value(id);
  }
}

export const variant_service = new VariantService();
