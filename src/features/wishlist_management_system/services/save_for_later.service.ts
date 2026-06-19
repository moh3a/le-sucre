import "server-only";

import { z } from "zod";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { WISHLIST_ERROR } from "../constants/error-codes";
import { WISHLIST_CACHE_KEYS } from "../constants/cache-keys";
import { SaveForLaterRepository } from "../repositories/save_for_later.repository";
import { WishlistCacheService } from "./wishlist-cache.service";
import { WishlistAnalyticsService } from "./wishlist-analytics.service";
import type {
  save_for_later_dto,
  move_to_cart_dto,
  list_saved_items_dto,
} from "../models/save_for_later.dto";

export class SaveForLaterService {
  constructor(
    private readonly repo = new SaveForLaterRepository(),
    private readonly cache = new WishlistCacheService(),
    private readonly analytics = new WishlistAnalyticsService(),
  ) {}

  async list(customer_id: string, input: z.infer<typeof list_saved_items_dto>) {
    const cache_key = WISHLIST_CACHE_KEYS.save_for_later.by_customer(customer_id);
    const cached = await this.cache.get<Awaited<ReturnType<SaveForLaterRepository["list_by_customer"]>>>(cache_key);
    if (cached) return cached;

    const result = await this.repo.list_by_customer(customer_id, input.page, input.limit);
    await this.cache.set(cache_key, result, WISHLIST_CACHE_KEYS.save_for_later.ttl);
    return result;
  }

  async save(customer_id: string, input: z.infer<typeof save_for_later_dto>) {
    const existing = await this.repo.find_by_customer_and_product(
      customer_id,
      input.product_id,
      input.variant_id ?? null,
    );
    if (existing) throw_error(WISHLIST_ERROR.DUPLICATE_SAVED);

    const id = generate_id();
    await this.repo.create({
      id,
      customer_id,
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      quantity: input.quantity,
      original_cart_item_id: input.original_cart_item_id ?? null,
      notes: input.notes ?? null,
    });

    await this.cache.invalidate_customer_saved(customer_id);
    await this.analytics.record_event(customer_id, null, input.product_id, "move_to_save_later");

    audit_service.log({
      action: "save_for_later.added",
      resource_type: "save_for_later",
      resource_id: id,
      metadata: { product_id: input.product_id, variant_id: input.variant_id },
    });

    return { id };
  }

  async move_to_cart(customer_id: string, input: z.infer<typeof move_to_cart_dto>) {
    const saved = await this.repo.find_by_id(input.id);
    if (!saved) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (saved.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const quantity = input.quantity ?? saved.quantity;

    await this.repo.delete(input.id);
    await this.cache.invalidate_customer_saved(customer_id);
    await this.analytics.record_event(customer_id, null, saved.product_id, "move_from_save_later");

    audit_service.log({
      action: "save_for_later.moved_to_cart",
      resource_type: "save_for_later",
      resource_id: input.id,
      metadata: { product_id: saved.product_id, quantity },
    });

    return {
      product_id: saved.product_id,
      variant_id: saved.variant_id,
      quantity,
    };
  }

  async remove(customer_id: string, id: string) {
    const saved = await this.repo.find_by_id(id);
    if (!saved) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (saved.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    await this.repo.delete(id);
    await this.cache.invalidate_customer_saved(customer_id);
  }
}

export const save_for_later_service = new SaveForLaterService();
