import "server-only";

import { eq } from "drizzle-orm";

import { db, type DbClient } from "@/lib/db";
import { redis } from "@/lib/redis";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { PRODUCT_CACHE } from "@/features/product_information_management/products/constants/cache-keys";
import { inventory_levels } from "../schema";
import { invalidate_catalog_cache } from "@/features/catalog_discovery/helpers/invalidate-catalog-cache.helper";

type Tx = Pick<DbClient, "select" | "update">;

export async function sync_sku_stock_denormalized(
  sku_id: string,
  tx: Tx = db,
): Promise<string | null> {
  const [level] = await tx
    .select()
    .from(inventory_levels)
    .where(eq(inventory_levels.sku_id, sku_id))
    .limit(1);

  const available = level ? Math.max(0, level.quantity_on_hand - level.quantity_reserved) : 0;

  await tx
    .update(product_skus)
    .set({ stock_available: available })
    .where(eq(product_skus.id, sku_id));

  const [sku] = await tx
    .select({ product_id: product_skus.product_id })
    .from(product_skus)
    .where(eq(product_skus.id, sku_id))
    .limit(1);

  void invalidate_catalog_cache();

  return sku?.product_id ?? null;
}

export async function invalidate_product_stock_cache(product_id: string) {
  try {
    await redis.del(PRODUCT_CACHE.by_id(product_id), PRODUCT_CACHE.price_range(product_id));
  } catch {
    // cache optional
  }
}
