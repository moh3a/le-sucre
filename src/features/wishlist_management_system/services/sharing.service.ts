import "server-only";

import { z } from "zod";
import { generate_id, slugify } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { WISHLIST_ERROR } from "../constants/error-codes";
import { WISHLIST_CACHE_KEYS } from "../constants/cache-keys";
import { WishlistRepository } from "../repositories/wishlist.repository";
import { WishlistItemRepository } from "../repositories/wishlist_item.repository";
import { WishlistShareRepository } from "../repositories/share.repository";
import { WishlistCacheService } from "./wishlist-cache.service";
import { WishlistAnalyticsService } from "./wishlist-analytics.service";
import type { create_share_link_dto, list_share_links_dto } from "../models/share.dto";
import type { WishlistWithProduct } from "../types";

export class SharingService {
  constructor(
    private readonly wishlist_repo = new WishlistRepository(),
    private readonly item_repo = new WishlistItemRepository(),
    private readonly share_repo = new WishlistShareRepository(),
    private readonly cache = new WishlistCacheService(),
    private readonly analytics = new WishlistAnalyticsService(),
  ) {}

  async create_share_link(customer_id: string, input: z.infer<typeof create_share_link_dto>) {
    const wishlist = await this.wishlist_repo.find_by_id(input.wishlist_id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    const token = generate_id();
    const expires_at = input.expires_in_days
      ? new Date(Date.now() + input.expires_in_days * 86400000).toISOString()
      : null;

    const id = generate_id();
    await this.share_repo.create({
      id,
      wishlist_id: input.wishlist_id,
      token,
      is_active: true,
      permission: input.permission,
      expires_at,
      max_uses: input.max_uses,
      use_count: 0,
      created_by: customer_id,
    });

    await this.wishlist_repo.increment_shared_count(input.wishlist_id);
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.share.by_token(token));
    await this.analytics.record_event(customer_id, input.wishlist_id, null, "share_wishlist");

    return {
      id,
      token,
      url: `/shared/wishlist/${token}`,
      expires_at,
      permission: input.permission,
    };
  }

  async revoke_share_link(customer_id: string, token_id: string) {
    const link = await this.share_repo.find_by_id(token_id);
    if (!link) throw_error(WISHLIST_ERROR.SHARE_TOKEN_NOT_FOUND);

    const wishlist = await this.wishlist_repo.find_by_id(link.wishlist_id);
    if (!wishlist || wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    await this.share_repo.deactivate(token_id);
    await this.cache.invalidate(WISHLIST_CACHE_KEYS.share.by_token(link.token));
  }

  async get_shared_wishlist(token: string) {
    const cache_key = WISHLIST_CACHE_KEYS.share.by_token(token);
    const cached = await this.cache.get<{ wishlist: Record<string, unknown>; items: WishlistWithProduct[] }>(cache_key);
    if (cached) return cached;

    const share_token = await this.share_repo.find_by_token(token);
    if (!share_token) throw_error(WISHLIST_ERROR.SHARE_TOKEN_NOT_FOUND);
    if (!share_token.is_active) throw_error(WISHLIST_ERROR.SHARE_TOKEN_NOT_FOUND);

    if (share_token.expires_at && new Date(share_token.expires_at) < new Date()) {
      await this.share_repo.deactivate(share_token.id);
      throw_error(WISHLIST_ERROR.SHARE_TOKEN_NOT_FOUND);
    }

    if (share_token.max_uses > 0 && share_token.use_count >= share_token.max_uses) {
      await this.share_repo.deactivate(share_token.id);
      throw_error(WISHLIST_ERROR.SHARE_TOKEN_NOT_FOUND);
    }

    const wishlist = await this.wishlist_repo.find_by_id(share_token.wishlist_id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);

    const items = await this.item_repo.list_by_wishlist_all(share_token.wishlist_id);

    await this.share_repo.increment_use_count(share_token.id);

    const result = { wishlist, items: items as WishlistWithProduct[] };
    await this.cache.set(cache_key, result, WISHLIST_CACHE_KEYS.share.ttl);
    return result;
  }

  async list_share_links(customer_id: string, input: z.infer<typeof list_share_links_dto>) {
    const wishlist = await this.wishlist_repo.find_by_id(input.wishlist_id);
    if (!wishlist) throw_error(WISHLIST_ERROR.NOT_FOUND);
    if (wishlist.customer_id !== customer_id) throw_error(WISHLIST_ERROR.ACCESS_DENIED);

    return this.share_repo.list_by_wishlist(input.wishlist_id);
  }
}

export const sharing_service = new SharingService();
