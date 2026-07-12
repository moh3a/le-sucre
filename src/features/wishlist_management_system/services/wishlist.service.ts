import "server-only";

import { z } from "zod";
import { generate_id, slugify } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { WISHLIST_ERROR } from "../constants/error-codes";
import { WISHLIST_CACHE_KEYS } from "../constants/cache-keys";
import { WishlistRepository } from "../repositories/wishlist.repository";
import { WishlistItemRepository } from "../repositories/wishlist_item.repository";
import { WishlistCacheService } from "./wishlist-cache.service";
import { WishlistAnalyticsService } from "./wishlist-analytics.service";
import type {
  create_wishlist_dto,
  update_wishlist_dto,
  list_wishlists_dto,
} from "../models/wishlist.dto";
import type {
  add_wishlist_item_dto,
  update_wishlist_item_dto,
  move_wishlist_item_dto,
  bulk_add_wishlist_items_dto,
  list_wishlist_items_dto,
} from "../models/wishlist_item.dto";
import type { WishlistWithItems, WishlistWithProduct } from "../types";

const MAX_WISHLISTS = 50;
const MAX_WISHLIST_ITEMS = 500;

export class WishlistService {
  constructor(
    private readonly repo = new WishlistRepository(),
    private readonly item_repo = new WishlistItemRepository(),
    private readonly cache = new WishlistCacheService(),
    private readonly analytics = new WishlistAnalyticsService(),
  ) {}

  async list(customer_id: string, input: z.infer<typeof list_wishlists_dto>) {
    const cache_key = WISHLIST_CACHE_KEYS.wishlist.by_customer(customer_id);
    const cached = await this.cache.get<Awaited<ReturnType<WishlistRepository["list_by_customer"]>>>(cache_key);
    if (cached) return cached;

    const result = await this.repo.list_by_customer(customer_id, input.page, input.limit);
    await this.cache.set(cache_key, result, WISHLIST_CACHE_KEYS.wishlist.ttl);
    return result;
  }

  async get_by_id(id: string, customer_id: string) {
    const cache_key = WISHLIST_CACHE_KEYS.wishlist.by_id(id);
    const cached = await this.cache.get<WishlistWithItems>(cache_key);
    if (cached) return cached;

    const wishlist = await this.repo.find_by_id(id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id && !wishlist.is_public) {
      throw_error(WISHLIST_ERROR.ACCESS_DENIED);
    }

    const items = await this.item_repo.list_by_wishlist_all(id);
    const result = { ...wishlist, items: items as WishlistWithProduct[] };

    await this.cache.set(cache_key, result, WISHLIST_CACHE_KEYS.wishlist.ttl);
    return result;
  }

  async create(customer_id: string, input: z.infer<typeof create_wishlist_dto>) {
    const count = await this.repo.count_by_customer(customer_id);
    if (count >= MAX_WISHLISTS) throw_error(WISHLIST_ERROR.MAX_WISHLISTS);

    let slug = slugify(input.name);
    const existing = await this.repo.find_by_customer_and_slug(customer_id, slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const is_default = count === 0;

    const wishlist_id = generate_id();
    await this.repo.create({
      id: wishlist_id,
      customer_id,
      name: input.name,
      slug,
      description: input.description ?? null,
      is_default,
      is_public: input.is_public,
      is_private: input.is_private,
      cover_image_url: input.cover_image_url ?? null,
      metadata: input.metadata as Record<string, unknown>,
      sort_order: count,
    });

    await this.cache.invalidate_customer_wishlists(customer_id);
    await this.analytics.record_event(customer_id, wishlist_id, null, "wishlist_created");

    audit_service.log({
      action: "wishlist.created",
      resource_type: "wishlist",
      resource_id: wishlist_id,
      metadata: { name: input.name },
    });

    return this.get_by_id(wishlist_id, customer_id);
  }

  async update(customer_id: string, input: z.infer<typeof update_wishlist_dto>) {
    const wishlist = await this.repo.find_by_id(input.id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

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
    if (input.is_public !== undefined) update_data.is_public = input.is_public;
    if (input.is_private !== undefined) update_data.is_private = input.is_private;
    if (input.cover_image_url !== undefined) update_data.cover_image_url = input.cover_image_url;
    if (input.sort_order !== undefined) update_data.sort_order = input.sort_order;
    if (input.metadata !== undefined) update_data.metadata = input.metadata;

    await this.repo.update(input.id, update_data);
    await this.cache.invalidate_wishlist(input.id);
    await this.cache.invalidate_customer_wishlists(customer_id);

    audit_service.log({
      action: "wishlist.updated",
      resource_type: "wishlist",
      resource_id: input.id,
    });

    return this.get_by_id(input.id, customer_id);
  }

  async delete(customer_id: string, id: string) {
    const wishlist = await this.repo.find_by_id(id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    await this.repo.delete(id);
    await this.cache.invalidate_wishlist(id);
    await this.cache.invalidate_customer_wishlists(customer_id);

    this.analytics.record_event(customer_id, id, null, "wishlist_deleted");

    audit_service.log({
      action: "wishlist.deleted",
      resource_type: "wishlist",
      resource_id: id,
      metadata: { name: wishlist.name },
    });
  }

  async set_default(customer_id: string, id: string) {
    const wishlist = await this.repo.find_by_id(id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    await this.repo.unset_default_for_customer(customer_id);
    await this.repo.update(id, { is_default: true });
    await this.cache.invalidate_customer_wishlists(customer_id);
  }

  async add_item(customer_id: string, input: z.infer<typeof add_wishlist_item_dto>) {
    const wishlist = await this.repo.find_by_id(input.wishlist_id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const existing = await this.item_repo.find_by_wishlist_and_product(
      input.wishlist_id,
      input.product_id,
      input.variant_id ?? null,
    );
    if (existing) throw_error(WISHLIST_ERROR.DUPLICATE_ITEM);

    const item_count = await this.item_repo.count_by_wishlist(input.wishlist_id);
    if (item_count >= MAX_WISHLIST_ITEMS) {
      throw_error(WISHLIST_ERROR.MAX_ITEMS);
    }

    const item_id = generate_id();
    await this.item_repo.create({
      id: item_id,
      wishlist_id: input.wishlist_id,
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      quantity: input.quantity,
      priority: input.priority,
      notes: input.notes ?? null,
      sort_order: item_count,
    });

    await this.repo.increment_item_count(input.wishlist_id);
    await this.cache.invalidate_wishlist(input.wishlist_id);
    await this.analytics.record_event(customer_id, input.wishlist_id, input.product_id, "add_to_wishlist");

    audit_service.log({
      action: "wishlist.item.added",
      resource_type: "wishlist_item",
      resource_id: item_id,
      metadata: { wishlist_id: input.wishlist_id, product_id: input.product_id },
    });
  }

  async update_item(customer_id: string, input: z.infer<typeof update_wishlist_item_dto>) {
    const item = await this.item_repo.find_by_id(input.id);
    if (!item) throw_error(WISHLIST_ERROR.ITEM_NOT_FOUND);

    const wishlist = await this.repo.find_by_id(item.wishlist_id);
    if (!wishlist || wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const update_data: Record<string, unknown> = {};
    if (input.quantity !== undefined) update_data.quantity = input.quantity;
    if (input.priority !== undefined) update_data.priority = input.priority;
    if (input.notes !== undefined) update_data.notes = input.notes;
    if (input.sort_order !== undefined) update_data.sort_order = input.sort_order;

    await this.item_repo.update(input.id, update_data);
    await this.cache.invalidate_wishlist(item.wishlist_id);
  }

  async remove_item(customer_id: string, item_id: string) {
    const item = await this.item_repo.find_by_id(item_id);
    if (!item) throw_error(WISHLIST_ERROR.ITEM_NOT_FOUND);

    const wishlist = await this.repo.find_by_id(item.wishlist_id);
    if (!wishlist || wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    await this.item_repo.delete(item_id);
    await this.repo.decrement_item_count(item.wishlist_id);
    await this.cache.invalidate_wishlist(item.wishlist_id);
    await this.analytics.record_event(customer_id, item.wishlist_id, item.product_id!, "remove_from_wishlist");

    audit_service.log({
      action: "wishlist.item.removed",
      resource_type: "wishlist_item",
      resource_id: item_id,
    });
  }

  async move_item(customer_id: string, input: z.infer<typeof move_wishlist_item_dto>) {
    const item = await this.item_repo.find_by_id(input.item_id);
    if (!item) throw_error(WISHLIST_ERROR.ITEM_NOT_FOUND);

    const from_wishlist = await this.repo.find_by_id(input.from_wishlist_id);
    if (!from_wishlist || from_wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const to_wishlist = await this.repo.find_by_id(input.to_wishlist_id);
    if (!to_wishlist || to_wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const existing = await this.item_repo.find_by_wishlist_and_product(
      input.to_wishlist_id,
      item.product_id,
      item.variant_id,
    );
    if (existing) throw_error(WISHLIST_ERROR.DUPLICATE_ITEM);

    await this.item_repo.update(input.item_id, { wishlist_id: input.to_wishlist_id });
    await this.repo.decrement_item_count(input.from_wishlist_id);
    await this.repo.increment_item_count(input.to_wishlist_id);
    await this.cache.invalidate_wishlist(input.from_wishlist_id);
    await this.cache.invalidate_wishlist(input.to_wishlist_id);
  }

  async bulk_add(customer_id: string, input: z.infer<typeof bulk_add_wishlist_items_dto>) {
    const wishlist = await this.repo.find_by_id(input.wishlist_id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const added: string[] = [];
    for (const item of input.items) {
      const existing = await this.item_repo.find_by_wishlist_and_product(
        input.wishlist_id,
        item.product_id,
        item.variant_id ?? null,
      );
      if (existing) continue;

      const item_id = generate_id();
      await this.item_repo.create({
        id: item_id,
        wishlist_id: input.wishlist_id,
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
        priority: item.priority,
        notes: item.notes ?? null,
      });
      await this.repo.increment_item_count(input.wishlist_id);
      await this.analytics.record_event(customer_id, input.wishlist_id, item.product_id, "add_to_wishlist");
      added.push(item_id);
    }

    if (added.length > 0) {
      await this.cache.invalidate_wishlist(input.wishlist_id);
    }

    return { added_count: added.length };
  }

  async list_items(customer_id: string, input: z.infer<typeof list_wishlist_items_dto>) {
    const wishlist = await this.repo.find_by_id(input.wishlist_id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id && !wishlist.is_public) {
      throw_error(WISHLIST_ERROR.ACCESS_DENIED);
    }

    return this.item_repo.list_by_wishlist(
      input.wishlist_id,
      input.page,
      input.limit,
      { priority: input.priority, is_purchased: input.is_purchased },
    );
  }

  async get_stats(customer_id: string): Promise<{
    total_wishlists: number;
    total_items: number;
    total_purchased: number;
    conversion_rate: number;
  }> {
    const [items] = await Promise.all([
      this.item_repo.get_total_saved_by_customer(customer_id),
    ]);
    const purchased = await this.item_repo.get_customer_purchased_count(customer_id);
    const wishlist_count = await this.repo.count_by_customer(customer_id);

    return {
      total_wishlists: wishlist_count,
      total_items: items,
      total_purchased: purchased,
      conversion_rate: items > 0 ? Math.round((purchased / items) * 10000) / 100 : 0,
    };
  }

  async get_public_wishlist(customer_id: string) {
    const all = await this.repo.find_by_customer(customer_id);
    return all.filter((w) => w.is_public);
  }
}

export const wishlist_service = new WishlistService();
