import { redis } from "@/lib/redis";
import { PRODUCT_CACHE } from "@/features/product_information_management/products/constants/cache-keys";

export async function invalidate_product_stock_cache(product_id: string) {
  try {
    await redis.del(PRODUCT_CACHE.by_id(product_id), PRODUCT_CACHE.price_range(product_id));
  } catch {
    // cache optional
  }
}
