import "server-only";

import { redis } from "@/lib/redis";
import { WISHLIST_CACHE_KEYS } from "../constants/cache-keys";

export class WishlistCacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  }

  async invalidate(key: string): Promise<void> {
    await redis.del(key);
  }

  async invalidate_pattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async invalidate_customer_wishlists(customer_id: string): Promise<void> {
    await Promise.all([
      this.invalidate(WISHLIST_CACHE_KEYS.wishlist.by_customer(customer_id)),
      this.invalidate(WISHLIST_CACHE_KEYS.wishlist.default(customer_id)),
    ]);
  }

  async invalidate_wishlist(wishlist_id: string): Promise<void> {
    await Promise.all([
      this.invalidate(WISHLIST_CACHE_KEYS.wishlist.by_id(wishlist_id)),
      this.invalidate(WISHLIST_CACHE_KEYS.wishlist_items.by_wishlist(wishlist_id)),
    ]);
  }

  async invalidate_customer_collections(customer_id: string): Promise<void> {
    await this.invalidate(WISHLIST_CACHE_KEYS.collection.by_customer(customer_id));
  }

  async invalidate_customer_favorites(customer_id: string): Promise<void> {
    await this.invalidate(WISHLIST_CACHE_KEYS.favorites.by_customer(customer_id));
  }

  async invalidate_customer_saved(customer_id: string): Promise<void> {
    await this.invalidate(WISHLIST_CACHE_KEYS.save_for_later.by_customer(customer_id));
  }

  async invalidate_analytics(): Promise<void> {
    await this.invalidate_pattern("wishlist:analytics:*");
  }

  async invalidate_all_customer(customer_id: string): Promise<void> {
    await Promise.all([
      this.invalidate_customer_wishlists(customer_id),
      this.invalidate_customer_collections(customer_id),
      this.invalidate_customer_favorites(customer_id),
      this.invalidate_customer_saved(customer_id),
    ]);
  }
}

export const wishlist_cache_service = new WishlistCacheService();
