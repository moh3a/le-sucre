import { z } from "zod";

import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";

import {
  create_property_dto,
  update_property_dto,
  create_property_value_dto,
  update_property_value_dto,
  generate_skus_dto,
  create_sku_dto,
  update_sku_dto,
  set_sku_price_tier_dto,
  delete_sku_price_tier_dto,
  upsert_wholesale_rule_dto,
  delete_wholesale_rule_dto,
  resolve_price_dto,
} from "./models/variant.dto";
import { variant_service } from "./services/variant.service";
import { sku_service } from "./services/sku.service";

const product_id_dto = z.object({ product_id: z.string().min(1).max(255) });
const sku_id_dto = z.object({ id: z.string().min(1).max(255) });
const property_id_dto = z.object({ id: z.string().min(1).max(255) });
const value_id_dto = z.object({ id: z.string().min(1).max(255) });

export const variants_router = create_trpc_router({
  adminList: permission_procedure(PERMISSIONS.products_read)
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(({ input }) => sku_service.list_admin(input)),

  adminStats: permission_procedure(PERMISSIONS.products_read)
    .query(() => sku_service.stats_admin()),

  // Variant config
  getConfig: permission_procedure(PERMISSIONS.products_read)
    .input(product_id_dto)
    .query(({ input }) => variant_service.get_variant_config(input.product_id)),

  enableVariants: permission_procedure(PERMISSIONS.products_write)
    .input(product_id_dto)
    .mutation(({ input }) => variant_service.enable_variants(input.product_id)),

  createProperty: permission_procedure(PERMISSIONS.products_write)
    .input(create_property_dto)
    .mutation(({ input }) => variant_service.create_property(input)),

  updateProperty: permission_procedure(PERMISSIONS.products_write)
    .input(update_property_dto)
    .mutation(({ input }) => variant_service.update_property(input)),

  deleteProperty: permission_procedure(PERMISSIONS.products_write)
    .input(property_id_dto)
    .mutation(({ input }) => variant_service.delete_property(input.id)),

  createPropertyValue: permission_procedure(PERMISSIONS.products_write)
    .input(create_property_value_dto)
    .mutation(({ input }) => variant_service.create_property_value(input)),

  updatePropertyValue: permission_procedure(PERMISSIONS.products_write)
    .input(update_property_value_dto)
    .mutation(({ input }) => variant_service.update_property_value(input)),

  deletePropertyValue: permission_procedure(PERMISSIONS.products_write)
    .input(value_id_dto)
    .mutation(({ input }) => variant_service.delete_property_value(input.id)),

  // SKUs
  listSkus: permission_procedure(PERMISSIONS.products_read)
    .input(product_id_dto)
    .query(({ input }) => sku_service.list_by_product(input.product_id)),

  getSku: permission_procedure(PERMISSIONS.products_read)
    .input(sku_id_dto)
    .query(({ input }) => sku_service.get_by_id(input.id)),

  createSku: permission_procedure(PERMISSIONS.products_write)
    .input(create_sku_dto)
    .mutation(({ input }) => sku_service.create(input)),

  updateSku: permission_procedure(PERMISSIONS.products_write)
    .input(update_sku_dto)
    .mutation(({ input }) => sku_service.update(input)),

  deleteSku: permission_procedure(PERMISSIONS.products_write)
    .input(sku_id_dto)
    .mutation(({ input }) => sku_service.remove(input.id)),

  bulkUpdateSku: permission_procedure(PERMISSIONS.products_write)
    .input(
      z.object({
        ids: z.array(z.string().min(1)),
        base_price: z.number().optional().nullable(),
        offer_price: z.number().optional().nullable(),
        is_active: z.boolean().optional(),
      }),
    )
    .mutation(({ input }) => sku_service.bulk_update(input)),

  bulkDeleteSku: permission_procedure(PERMISSIONS.products_write)
    .input(
      z.object({
        ids: z.array(z.string().min(1)),
      }),
    )
    .mutation(({ input }) => sku_service.bulk_delete(input.ids)),

  generateSkus: permission_procedure(PERMISSIONS.products_write)
    .input(generate_skus_dto)
    .mutation(({ input }) => sku_service.generate(input)),

  // Pricing
  setSkuPriceTier: permission_procedure(PERMISSIONS.products_write)
    .input(set_sku_price_tier_dto)
    .mutation(({ input }) => sku_service.set_price_tier(input)),

  deleteSkuPriceTier: permission_procedure(PERMISSIONS.products_write)
    .input(delete_sku_price_tier_dto)
    .mutation(({ input }) => sku_service.delete_price_tier(input)),

  upsertWholesaleRule: permission_procedure(PERMISSIONS.products_write)
    .input(upsert_wholesale_rule_dto)
    .mutation(({ input }) => sku_service.upsert_wholesale_rule(input)),

  deleteWholesaleRule: permission_procedure(PERMISSIONS.products_write)
    .input(delete_wholesale_rule_dto)
    .mutation(({ input }) => sku_service.delete_wholesale_rule(input)),

  resolvePrice: permission_procedure(PERMISSIONS.products_read)
    .input(resolve_price_dto)
    .query(({ input }) => sku_service.resolve_price(input)),

  getPriceRange: permission_procedure(PERMISSIONS.products_read)
    .input(product_id_dto)
    .query(({ input }) => sku_service.get_price_range(input.product_id)),
});
