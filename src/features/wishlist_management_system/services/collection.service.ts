import "server-only";

import { z } from "zod";
import { generate_id, slugify } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { WISHLIST_ERROR } from "../constants/error-codes";
import { WISHLIST_CACHE_KEYS } from "../constants/cache-keys";
import { CollectionRepository, CollectionItemRepository } from "../repositories/collection.repository";
import { WishlistCacheService } from "./wishlist-cache.service";
import { WishlistAnalyticsService } from "./wishlist-analytics.service";
import type {
  create_collection_dto,
  update_collection_dto,
  list_collections_dto,
  add_collection_item_dto,
  list_collection_items_dto,
} from "../models/collection.dto";
import type { CollectionWithItems, CollectionItemWithProduct } from "../types";

const MAX_COLLECTIONS = 50;

export class CollectionService {
  constructor(
    private readonly repo = new CollectionRepository(),
    private readonly item_repo = new CollectionItemRepository(),
    private readonly cache = new WishlistCacheService(),
    private readonly analytics = new WishlistAnalyticsService(),
  ) {}

  async list(customer_id: string, input: z.infer<typeof list_collections_dto>) {
    const cache_key = WISHLIST_CACHE_KEYS.collection.by_customer(customer_id);
    const cached = await this.cache.get<Awaited<ReturnType<CollectionRepository["list_by_customer"]>>>(cache_key);
    if (cached) return cached;

    const result = await this.repo.list_by_customer(customer_id, input.page, input.limit, input.is_public);
    await this.cache.set(cache_key, result, WISHLIST_CACHE_KEYS.collection.ttl);
    return result;
  }

  async list_public(page: number, limit: number) {
    const cache_key = WISHLIST_CACHE_KEYS.collection.public();
    const cached = await this.cache.get<Awaited<ReturnType<CollectionRepository["list_public"]>>>(cache_key);
    if (cached) return cached;

    const result = await this.repo.list_public(page, limit);
    await this.cache.set(cache_key, result, WISHLIST_CACHE_KEYS.collection.ttl);
    return result;
  }

  async get_by_id(id: string, customer_id: string) {
    const cache_key = WISHLIST_CACHE_KEYS.collection.by_id(id);
    const cached = await this.cache.get<CollectionWithItems>(cache_key);
    if (cached) return cached;

    const collection = await this.repo.find_by_id(id);
    if (!collection) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);
    if (collection.customer_id !== customer_id && !collection.is_public) {
      throw_error(WISHLIST_ERROR.ACCESS_DENIED);
    }

    const items = await this.item_repo.list_by_collection(id, 1, 100);
    const result = { ...collection, items: items.items as CollectionItemWithProduct[] };
    await this.cache.set(cache_key, result, WISHLIST_CACHE_KEYS.collection.ttl);
    return result;
  }

  async create(customer_id: string, input: z.infer<typeof create_collection_dto>) {
    const count = await this.repo.count_by_customer(customer_id);
    if (count >= MAX_COLLECTIONS) throw_error(WISHLIST_ERROR.MAX_COLLECTIONS);

    let slug = slugify(input.name);
    const existing = await this.repo.find_by_customer_and_slug(customer_id, slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const id = generate_id();
    await this.repo.create({
      id,
      customer_id,
      name: input.name,
      slug,
      description: input.description ?? null,
      cover_image_url: input.cover_image_url ?? null,
      is_public: input.is_public,
      metadata: input.metadata as Record<string, unknown>,
      sort_order: count,
    });

    await this.cache.invalidate_customer_collections(customer_id);

    audit_service.log({
      action: "collection.created",
      resource_type: "collection",
      resource_id: id,
      metadata: { name: input.name },
    });

    return this.get_by_id(id, customer_id);
  }

  async update(customer_id: string, input: z.infer<typeof update_collection_dto>) {
    const collection = await this.repo.find_by_id(input.id);
    if (!collection) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);
    if (collection.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const update_data: Record<string, unknown> = {};

    if (input.name !== undefined) {
      update_data.name = input.name;
      let slug = slugify(input.name);
      const existing = await this.repo.find_by_customer_and_slug(customer_id, slug);
      if (existing && existing.id !== input.id) {
        slug = `${slug}-${Date.now()}`;
      }
      update_data.slug = slug;
    }

    if (input.description !== undefined) update_data.description = input.description;
    if (input.cover_image_url !== undefined) update_data.cover_image_url = input.cover_image_url;
    if (input.is_public !== undefined) update_data.is_public = input.is_public;
    if (input.sort_order !== undefined) update_data.sort_order = input.sort_order;
    if (input.metadata !== undefined) update_data.metadata = input.metadata;

    await this.repo.update(input.id, update_data);
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.collection.by_id(input.id));
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.collection.public());
    await this.cache.invalidate_customer_collections(customer_id);

    return this.get_by_id(input.id, customer_id);
  }

  async delete(customer_id: string, id: string) {
    const collection = await this.repo.find_by_id(id);
    if (!collection) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);
    if (collection.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    await this.repo.delete(id);
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.collection.by_id(id));
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.collection.public());
    await this.cache.invalidate_customer_collections(customer_id);
  }

  async add_item(customer_id: string, input: z.infer<typeof add_collection_item_dto>) {
    const collection = await this.repo.find_by_id(input.collection_id);
    if (!collection) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);
    if (collection.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const existing = await this.item_repo.find_by_collection_and_product(
      input.collection_id,
      input.product_id,
      input.variant_id ?? null,
    );
    if (existing) throw_error(WISHLIST_ERROR.DUPLICATE_ITEM);

    const id = generate_id();
    await this.item_repo.create({
      id,
      collection_id: input.collection_id,
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      notes: input.notes ?? null,
    });

    await this.repo.increment_item_count(input.collection_id);
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.collection.by_id(input.collection_id));
    await this.analytics.record_event(customer_id, null, input.product_id, "add_to_collection");

    return { id };
  }

  async remove_item(customer_id: string, collection_id: string, item_id: string) {
    const collection = await this.repo.find_by_id(collection_id);
    if (!collection) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);
    if (collection.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const item = await this.item_repo.find_by_id(item_id);
    if (!item || item.collection_id !== collection_id) throw_error(WISHLIST_ERROR.COLLECTION_ITEM_NOT_FOUND);

    await this.item_repo.delete(item_id);
    await this.repo.decrement_item_count(collection_id);
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.collection.by_id(collection_id));
    await this.analytics.record_event(customer_id, null, item.product_id!, "remove_from_collection");
  }

  async get_shared_collection(token: string) {
    const collection = await this.repo.find_by_share_token(token);
    if (!collection) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);
    if (!collection.is_public) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);

    const items = await this.item_repo.get_items_with_products(collection.id);

    return { collection, items };
  }

  async list_items(customer_id: string, input: z.infer<typeof list_collection_items_dto>) {
    const collection = await this.repo.find_by_id(input.collection_id);
    if (!collection) throw_error(WISHLIST_ERROR.COLLECTION_NOT_FOUND);
    if (collection.customer_id !== customer_id && !collection.is_public) {
      throw_error(WISHLIST_ERROR.ACCESS_DENIED);
    }

    return this.item_repo.list_by_collection(input.collection_id, input.page, input.limit);
  }
}

export const collection_service = new CollectionService();
