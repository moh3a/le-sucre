import "server-only";

import { logger } from "@/lib/logger";
import { soft_delete_service, type SoftDeleteConfig } from "@/lib/db/soft-delete.service";
import { SOFT_DELETE_RETENTION_DAYS } from "@/lib/security/compliance";
import { brands } from "@/features/product_information_management/brands/schema";
import { categories } from "@/features/product_information_management/categories/schema";
import { products } from "@/features/product_information_management/products/schema";
import {
  product_skus,
  product_properties,
  property_values,
} from "@/features/product_information_management/variants/schema";
import { warehouses } from "@/features/inventory_management_system/warehouses/schema";
import { campaigns } from "@/features/campaign_management_system/schema";
import { promotions } from "@/features/order_management_system/promotions/schema";
import { product_reviews } from "@/features/product_reviews_management/schema";
import { feature_flags } from "@/features/feature_flag_system/db/schema";
import { invoices } from "@/features/billing_and_finance_system/db/schema";

/** All entity soft-delete configurations for cleanup */
const ENTITY_CONFIGS: Record<string, SoftDeleteConfig & { retentionDays: number }> = {
  brands: {
    table: brands,
    idColumn: brands.id,
    deletedAtColumn: brands.deleted_at,
    deletedByColumn: brands.deleted_by,
    restoredAtColumn: brands.restored_at,
    restoredByColumn: brands.restored_by,
    entityType: "brand",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.brands,
  },
  categories: {
    table: categories,
    idColumn: categories.id,
    deletedAtColumn: categories.deleted_at,
    deletedByColumn: categories.deleted_by,
    restoredAtColumn: categories.restored_at,
    restoredByColumn: categories.restored_by,
    entityType: "category",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.categories,
  },
  products: {
    table: products,
    idColumn: products.id,
    deletedAtColumn: products.deleted_at,
    deletedByColumn: products.deleted_by,
    restoredAtColumn: products.restored_at,
    restoredByColumn: products.restored_by,
    entityType: "product",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.products,
  },
  product_skus: {
    table: product_skus,
    idColumn: product_skus.id,
    deletedAtColumn: product_skus.deleted_at,
    deletedByColumn: product_skus.deleted_by,
    entityType: "sku",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.product_skus,
  },
  product_properties: {
    table: product_properties,
    idColumn: product_properties.id,
    deletedAtColumn: product_properties.deleted_at,
    deletedByColumn: product_properties.deleted_by,
    entityType: "product_property",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.product_properties,
  },
  property_values: {
    table: property_values,
    idColumn: property_values.id,
    deletedAtColumn: property_values.deleted_at,
    deletedByColumn: property_values.deleted_by,
    entityType: "property_value",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.property_values,
  },
  warehouses: {
    table: warehouses,
    idColumn: warehouses.id,
    deletedAtColumn: warehouses.deleted_at,
    deletedByColumn: warehouses.deleted_by,
    restoredAtColumn: warehouses.restored_at,
    restoredByColumn: warehouses.restored_by,
    entityType: "warehouse",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.warehouses,
  },
  campaigns: {
    table: campaigns,
    idColumn: campaigns.id,
    deletedAtColumn: campaigns.deleted_at,
    deletedByColumn: campaigns.deleted_by,
    restoredAtColumn: campaigns.restored_at,
    restoredByColumn: campaigns.restored_by,
    entityType: "campaign",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.campaigns,
  },
  promotions: {
    table: promotions,
    idColumn: promotions.id,
    deletedAtColumn: promotions.deleted_at,
    deletedByColumn: promotions.deleted_by,
    restoredAtColumn: promotions.restored_at,
    restoredByColumn: promotions.restored_by,
    entityType: "promotion",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.promotions,
  },
  product_reviews: {
    table: product_reviews,
    idColumn: product_reviews.id,
    deletedAtColumn: product_reviews.deleted_at,
    deletedByColumn: product_reviews.deleted_by,
    restoredAtColumn: product_reviews.restored_at,
    restoredByColumn: product_reviews.restored_by,
    entityType: "review",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.product_reviews,
  },
  feature_flags: {
    table: feature_flags,
    idColumn: feature_flags.id,
    deletedAtColumn: feature_flags.deleted_at,
    deletedByColumn: feature_flags.deleted_by,
    entityType: "feature_flag",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.feature_flags,
  },
  invoices: {
    table: invoices,
    idColumn: invoices.id,
    deletedAtColumn: invoices.deleted_at,
    deletedByColumn: invoices.deleted_by,
    restoredAtColumn: invoices.restored_at,
    restoredByColumn: invoices.restored_by,
    entityType: "invoice",
    retentionDays: SOFT_DELETE_RETENTION_DAYS.invoices,
  },
};

export class SoftDeleteCleanupService {
  /**
   * Run cleanup for all configured entities.
   * Returns a summary of how many records were permanently deleted per entity.
   */
  async runCleanup(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};

    for (const [entityKey, config] of Object.entries(ENTITY_CONFIGS)) {
      try {
        const deletedCount = await soft_delete_service.cleanupExpired(config, config.retentionDays);
        if (deletedCount > 0) {
          results[entityKey] = deletedCount;
          logger.info("soft_delete_cleanup_batch", {
            entity: entityKey,
            deleted: deletedCount,
            retention_days: config.retentionDays,
          });
        }
      } catch (error) {
        logger.error("soft_delete_cleanup_entity_failed", {
          entity: entityKey,
          message: error instanceof Error ? error.message : "unknown",
        });
      }
    }

    return results;
  }

  /**
   * Run cleanup for a single entity type.
   */
  async runForEntity(entityKey: string): Promise<number> {
    const config = ENTITY_CONFIGS[entityKey];
    if (!config) {
      throw new Error(`Unknown entity type for cleanup: ${entityKey}`);
    }

    const deletedCount = await soft_delete_service.cleanupExpired(config, config.retentionDays);

    logger.info("soft_delete_cleanup_single", {
      entity: entityKey,
      deleted: deletedCount,
      retention_days: config.retentionDays,
    });

    return deletedCount;
  }

  /**
   * Get the list of supported entity types and their retention days.
   */
  getConfigurations(): Array<{ entity: string; retentionDays: number }> {
    return Object.entries(ENTITY_CONFIGS).map(([key, config]) => ({
      entity: key,
      retentionDays: config.retentionDays,
    }));
  }
}

export const soft_delete_cleanup_service = new SoftDeleteCleanupService();
