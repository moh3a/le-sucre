import "server-only";

import { z } from "zod";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { WISHLIST_ERROR } from "../constants/error-codes";
import { WISHLIST_CACHE_KEYS } from "../constants/cache-keys";
import { FavoritesRepository } from "../repositories/favorites.repository";
import { WishlistCacheService } from "./wishlist-cache.service";
import { WishlistAnalyticsService } from "./wishlist-analytics.service";
import type { add_favorite_dto, list_favorites_dto } from "../models/favorites.dto";

export class FavoritesService {
  constructor(
    private readonly repo = new FavoritesRepository(),
    private readonly cache = new WishlistCacheService(),
    private readonly analytics = new WishlistAnalyticsService(),
  ) {}

  async list(customer_id: string, input: z.infer<typeof list_favorites_dto>) {
    const cache_key = WISHLIST_CACHE_KEYS.favorites.by_customer(customer_id);
    const cached = await this.cache.get<Awaited<ReturnType<FavoritesRepository["list_by_customer"]>>>(cache_key);
    if (cached && !input.type) return cached;

    return this.repo.list_by_customer(customer_id, input.page, input.limit, input.type);
  }

  async add(customer_id: string, input: z.infer<typeof add_favorite_dto>) {
    if (input.product_id) {
      const existing = await this.repo.find_by_customer_and_product(customer_id, input.product_id);
      if (existing) throw_error(WISHLIST_ERROR.DUPLICATE_FAVORITE);
    }
    if (input.brand_id) {
      const existing = await this.repo.find_by_customer_and_brand(customer_id, input.brand_id);
      if (existing) throw_error(WISHLIST_ERROR.DUPLICATE_FAVORITE);
    }
    if (input.category_id) {
      const existing = await this.repo.find_by_customer_and_category(customer_id, input.category_id);
      if (existing) throw_error(WISHLIST_ERROR.DUPLICATE_FAVORITE);
    }

    const id = generate_id();
    await this.repo.create({
      id,
      customer_id,
      product_id: input.product_id ?? null,
      brand_id: input.brand_id ?? null,
      category_id: input.category_id ?? null,
    });

    await this.cache.invalidate_customer_favorites(customer_id);

    if (input.product_id) {
      await this.cache.invalidate(WISHLIST_CACHE_KEYS.favorites.product_count(input.product_id));
      await this.analytics.record_event(customer_id, null, input.product_id, "favorite_product");
    }
    if (input.brand_id) {
      await this.cache.invalidate(WISHLIST_CACHE_KEYS.favorites.brand_count(input.brand_id));
    }
    if (input.category_id) {
      await this.cache.invalidate(WISHLIST_CACHE_KEYS.favorites.category_count(input.category_id));
    }

    audit_service.log({
      action: "favorite.added",
      resource_type: "favorite",
      resource_id: id,
      metadata: { product_id: input.product_id, brand_id: input.brand_id, category_id: input.category_id },
    });

    return { id };
  }

  async remove(customer_id: string, id: string) {
    const favorite = await this.repo.find_by_id(id);
    if (!favorite) throw_error(WISHLIST_ERROR.FAVORITE_NOT_FOUND);
    if (favorite.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    await this.repo.delete(id);
    await this.cache.invalidate_customer_favorites(customer_id);

    if (favorite.product_id) {
      await this.cache.invalidate(WISHLIST_CACHE_KEYS.favorites.product_count(favorite.product_id));
      await this.analytics.record_event(customer_id, null, favorite.product_id, "unfavorite_product");
    }
    if (favorite.brand_id) {
      await this.cache.invalidate(WISHLIST_CACHE_KEYS.favorites.brand_count(favorite.brand_id));
    }
    if (favorite.category_id) {
      await this.cache.invalidate(WISHLIST_CACHE_KEYS.favorites.category_count(favorite.category_id));
    }
  }

  async check(customer_id: string, input: { product_id?: string; brand_id?: string; category_id?: string }) {
    if (input.product_id) {
      return this.repo.find_by_customer_and_product(customer_id, input.product_id);
    }
    if (input.brand_id) {
      return this.repo.find_by_customer_and_brand(customer_id, input.brand_id);
    }
    if (input.category_id) {
      return this.repo.find_by_customer_and_category(customer_id, input.category_id);
    }
    return null;
  }

  async get_product_favorite_count(product_id: string) {
    const cache_key = WISHLIST_CACHE_KEYS.favorites.product_count(product_id);
    const cached = await this.cache.get<number>(cache_key);
    if (cached !== null) return cached;

    const count = await this.repo.count_by_product(product_id);
    await this.cache.set(cache_key, count, WISHLIST_CACHE_KEYS.favorites.ttl);
    return count;
  }

  async get_top_favorited(limit = 10) {
    const [products, brands, categories] = await Promise.all([
      this.repo.get_top_favorited_products(limit),
      this.repo.get_top_favorited_brands(limit),
      this.repo.get_top_favorited_categories(limit),
    ]);
    return { products, brands, categories };
  }
}

export const favorites_service = new FavoritesService();
