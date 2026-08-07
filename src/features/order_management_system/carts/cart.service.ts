import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/lib/db";
import { AppError } from "@/lib/error_handling";
import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { CART_ERROR } from "./constants/error-codes";
import { generate_id } from "@/lib/utils";
import { product_skus } from "@/features/product_information_management/variants/schema";
import {
  product_translations,
  product_media,
} from "@/features/product_information_management/products/schema";
import { resolve_unit_price } from "@/features/product_information_management/variants/engines/pricing.engine";
import { reservation_service } from "@/features/fulfillment_management_system/inventory/services/reservation.service";
import { carts } from "../schema";
import type { add_cart_item_dto } from "./models/cart.dto";
import { cart_repository } from "./repository";
import { availability_service } from "../preorders/services/availability.service";
import { preorder_allocation_service } from "../preorders/services/preorder-allocation.service";
import { PREORDER_ERROR } from "../preorders/constants/error-codes";
import { event_ingestion_service } from "@/features/marketing/analytics/services/event-ingestion.service";

const RESERVE_TTL_SEC = 900;

export class CartService {
  constructor(private readonly repo = cart_repository) {}

  /**
   * Releases a reservation best-effort. Reservations that were already released
   * or expired by the worker are a no-op so cart mutations stay resilient
   * instead of failing with RESERVATION_NOT_ACTIVE / RESERVATION_NOT_FOUND.
   */
  private async release_reservation_safely(reservation_id: string | null | undefined) {
    if (!reservation_id) return;
    try {
      await reservation_service.release(reservation_id);
    } catch (error) {
      if (
        error instanceof AppError &&
        (error.code === "RESERVATION_NOT_ACTIVE" || error.code === "RESERVATION_NOT_FOUND")
      ) {
        return;
      }
      throw error;
    }
  }

  async get_or_create_cart(input: {
    user_id?: string | null;
    cart_id?: string | null;
    guest_token?: string;
  }) {
    if (input.user_id) {
      const existing = await this.repo.find_active_by_user(input.user_id);
      if (existing) return existing;
      return this.repo.create({ user_id: input.user_id, guest_token: null });
    }
    if (input.cart_id) {
      const cart = await this.repo.find_by_id(input.cart_id);
      if (cart && cart.status === "active") return cart;
    }
    return this.repo.create({ user_id: null, guest_token: input.guest_token ?? generate_id() });
  }

  async get_cart_view(cart_id: string, locale = "fr") {
    const cart = await this.repo.find_by_id(cart_id);
    if (!cart) throw_error(CART_ERROR.NOT_FOUND);

    const items = await this.repo.list_items(cart_id);

    const product_ids = [...new Set(items.map((item) => item.product_id))];
    const media_map = new Map<string, string>();
    const translation_map = new Map<string, string>();
    if (product_ids.length) {
      const [media_rows, translation_rows] = await Promise.all([
        db
          .select({
            product_id: product_media.product_id,
            url: product_media.url,
            is_primary: product_media.is_primary,
            sort_order: product_media.sort_order,
          })
          .from(product_media)
          .where(inArray(product_media.product_id, product_ids))
          .orderBy(desc(product_media.is_primary), asc(product_media.sort_order)),
        db
          .select({ product_id: product_translations.product_id, name: product_translations.name })
          .from(product_translations)
          .where(
            and(
              inArray(product_translations.product_id, product_ids),
              eq(product_translations.locale, locale),
            ),
          ),
      ]);
      for (const row of media_rows) {
        if (!media_map.has(row.product_id)) media_map.set(row.product_id, row.url);
      }
      for (const row of translation_rows) {
        if (!translation_map.has(row.product_id)) translation_map.set(row.product_id, row.name);
      }
    }

    const enriched = items.map((item) => ({
      ...item,
      product_name: translation_map.get(item.product_id) ?? item.sku_id,
      image_url: media_map.get(item.product_id) ?? null,
      line_total: (Number(item.unit_price) * item.quantity).toFixed(2),
    }));
    const subtotal = enriched.reduce((s, i) => s + Number(i.line_total), 0).toFixed(2);
    return { cart_id, items: enriched, subtotal, currency: cart.currency ?? "DZD" };
  }

  async add_item(cart_id: string, input: z.infer<typeof add_cart_item_dto>) {
    const [sku] = await db
      .select()
      .from(product_skus)
      .where(eq(product_skus.id, input.sku_id))
      .limit(1);
    if (!sku) throw_error(CART_ERROR.SKU_NOT_FOUND);
    if (!sku.is_active) throw_error(CART_ERROR.SKU_INACTIVE);

    const price = await resolve_unit_price({
      sku_id: sku.id,
      product_id: sku.product_id,
      quantity: input.quantity,
      channel: "retail",
      currency: sku.currency ?? "DZD",
    });

    const existing = await this.repo.find_item(cart_id, input.sku_id);
    if (existing) {
      return this.update_quantity(cart_id, existing.id, {
        quantity: existing.quantity + input.quantity,
      });
    }

    const availability = await availability_service.resolve(input.sku_id, input.quantity);
    let reservation_id: string | null = null;
    let preorder_allocation_id: string | null = null;
    let fulfillment_type = "standard";
    if (availability.mode === "in_stock") {
      const reservation = await reservation_service.create({
        sku_id: input.sku_id,
        warehouse_id: "default",
        quantity: input.quantity,
        cart_id,
        expires_in_sec: RESERVE_TTL_SEC,
      });
      reservation_id = reservation.id;
    } else if (availability.mode === "preorder" || availability.mode === "backorder") {
      const alloc = await preorder_allocation_service.reserve_for_cart({
        sku_id: input.sku_id,
        quantity: input.quantity,
        cart_id,
        estimated_available_at: availability.estimated_available_at,
      });
      preorder_allocation_id = alloc.id;
      fulfillment_type = availability.fulfillment_type!;
    } else if (availability.mode === "blocked") {
      throw_error(PREORDER_ERROR.PREORDER_CAP_EXCEEDED);
    } else if (availability.available > 0) {
      throw_error(CART_ERROR.QUANTITY_EXCEEDS_STOCK);
    } else {
      throw_error(CART_ERROR.SKU_OUT_OF_STOCK);
    }

    await this.repo.insert_item({
      id: generate_id(),
      cart_id,
      sku_id: input.sku_id,
      product_id: sku.product_id,
      quantity: input.quantity,
      unit_price: price.unit_price,
      currency: price.currency,
      reservation_id,
      preorder_allocation_id,
      fulfillment_type,
    });

    void event_ingestion_service.track({
      event_type: "add_to_cart",
      product_id: sku.product_id,
      sku_id: sku.id,
      quantity: input.quantity,
    });

    return this.get_cart_view(cart_id);
  }

  async update_quantity(cart_id: string, item_id: string, input: { quantity: number }) {
    const item = await this.repo.find_item_by_id(item_id, cart_id);
    if (!item) throw_error(CART_ERROR.ITEM_NOT_FOUND);
    await this.release_reservation_safely(item.reservation_id);
    if (item.preorder_allocation_id) {
      await preorder_allocation_service.cancel(item.preorder_allocation_id);
    }
    const availability = await availability_service.resolve(item.sku_id, input.quantity);
    let reservation_id: string | null = null;
    let preorder_allocation_id: string | null = null;
    let fulfillment_type = "standard";
    if (availability.mode === "in_stock") {
      const reservation = await reservation_service.create({
        sku_id: item.sku_id,
        warehouse_id: "default",
        quantity: input.quantity,
        cart_id,
        expires_in_sec: RESERVE_TTL_SEC,
      });
      reservation_id = reservation.id;
    } else if (availability.mode === "preorder" || availability.mode === "backorder") {
      const alloc = await preorder_allocation_service.reserve_for_cart({
        sku_id: item.sku_id,
        quantity: input.quantity,
        cart_id,
        estimated_available_at: availability.estimated_available_at,
      });
      preorder_allocation_id = alloc.id;
      fulfillment_type = availability.fulfillment_type!;
    } else if (availability.mode === "blocked") {
      throw_error(PREORDER_ERROR.PREORDER_CAP_EXCEEDED);
    } else if (availability.available > 0) {
      throw_error(CART_ERROR.QUANTITY_EXCEEDS_STOCK);
    } else {
      throw_error(CART_ERROR.SKU_OUT_OF_STOCK);
    }
    await this.repo.update_item(item_id, {
      quantity: input.quantity,
      reservation_id,
      preorder_allocation_id,
      fulfillment_type,
    });
    return this.get_cart_view(cart_id);
  }

  async remove_item(cart_id: string, item_id: string) {
    const item = await this.repo.find_item_by_id(item_id, cart_id);
    if (!item) return this.get_cart_view(cart_id);
    await this.release_reservation_safely(item.reservation_id);
    if (item.preorder_allocation_id) {
      await preorder_allocation_service.cancel(item.preorder_allocation_id);
    }
    await this.repo.delete_item(item_id);
    return this.get_cart_view(cart_id);
  }

  /** On login: merge guest lines into user cart */
  async merge_guest_into_user(guest_cart_id: string, user_id: string) {
    const guest_cart = await this.repo.find_by_id(guest_cart_id);
    if (!guest_cart) throw_error(CART_ERROR.NOT_FOUND);

    const user_cart = await this.get_or_create_cart({ user_id });

    if (guest_cart_id === user_cart.id) return user_cart.id;
    if (guest_cart.status !== "active") return user_cart.id;

    const guest_items = await this.repo.list_items(guest_cart_id);
    if (!guest_items.length) {
      await db.update(carts).set({ status: "merged" }).where(eq(carts.id, guest_cart_id));
      return user_cart.id;
    }

    // Mark merged up-front so a retried login never double-counts already moved lines.
    await db.update(carts).set({ status: "merged" }).where(eq(carts.id, guest_cart_id));

    let merged = true;
    try {
      for (const line of guest_items) {
        await this.add_item(user_cart.id, { sku_id: line.sku_id, quantity: line.quantity });
      }
    } catch {
      merged = false;
    }

    for (const line of guest_items) {
      await this.release_reservation_safely(line.reservation_id);
      try {
        if (line.preorder_allocation_id) {
          await preorder_allocation_service.cancel(line.preorder_allocation_id);
        }
      } catch {
        // best-effort cleanup
      }
    }

    if (!merged) {
      throw_error(CART_ERROR.MERGE_FAILED, {
        detail: "Le panier invité n'a pas pu être entièrement fusionné. Les articles déjà ajoutés sont conservés.",
      });
    }
    return user_cart.id;
  }

  /** Ensures the acting caller owns the cart (IDOR guard for storefront mutations). */
  async assert_cart_owned(
    cart_id: string,
    identity: { user_id?: string | null; cookie_cart_id?: string | null },
  ) {
    const cart = await this.repo.find_by_id(cart_id);
    if (!cart) throw_error(CART_ERROR.NOT_FOUND);
    const is_owner = cart.user_id
      ? Boolean(identity.user_id && cart.user_id === identity.user_id)
      : cart_id === identity.cookie_cart_id;
    if (!is_owner) throw_error(CART_ERROR.NOT_FOUND);
    return cart;
  }

  /** Adds the first active SKU of a product (storefront listing cards / compare). */
  async add_product(cart_id: string, product_id: string, quantity = 1) {
    const [sku] = await db
      .select()
      .from(product_skus)
      .where(and(eq(product_skus.product_id, product_id), eq(product_skus.is_active, true)))
      .orderBy(asc(product_skus.created_at))
      .limit(1);
    if (!sku) throw_error(CART_ERROR.SKU_NOT_FOUND);
    return this.add_item(cart_id, { sku_id: sku.id, quantity });
  }

  async export_csv(input: { search?: string; status?: string }) {
    const { items } = await this.repo.list_admin({
      page: 1,
      limit: 100_000,
      search: input.search,
      status: input.status,
    });
    const escape = (value: string | number | null | undefined) => {
      const v = String(value ?? "");
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const header = [
      "id",
      "customer_name",
      "customer_email",
      "guest_token",
      "status",
      "currency",
      "item_count",
      "total_price",
      "created_at",
      "updated_at",
    ];
    const rows = items.map((i) =>
      [
        i.id,
        i.customer_name,
        i.customer_email,
        i.guest_token,
        i.status,
        i.currency,
        i.item_count,
        i.total_price,
        i.created_at,
        i.updated_at,
      ]
        .map(escape)
        .join(","),
    );
    return [header.join(","), ...rows].join("\n");
  }

  async list_admin(input: { page: number; limit: number; status?: string; search?: string }) {
    return this.repo.list_admin(input);
  }

  async stats_admin() {
    return this.repo.stats_admin();
  }

  async admin_remove_item(cart_id: string, item_id: string) {
    const cart = await this.repo.find_by_id(cart_id);
    if (!cart) throw_error(CART_ERROR.NOT_FOUND);
    const item = await this.repo.find_item_by_id(item_id, cart_id);
    if (!item) throw_error(CART_ERROR.ITEM_NOT_FOUND);
    await this.release_reservation_safely(item.reservation_id);
    if (item.preorder_allocation_id) {
      await preorder_allocation_service.cancel(item.preorder_allocation_id);
    }
    await this.repo.delete_item(item_id);
    return this.get_cart_view(cart_id);
  }

  async admin_clear_cart(cart_id: string) {
    const cart = await this.repo.find_by_id(cart_id);
    if (!cart) throw_error(CART_ERROR.NOT_FOUND);
    const items = await this.repo.list_items(cart_id);
    for (const item of items) {
      await this.release_reservation_safely(item.reservation_id);
      if (item.preorder_allocation_id) {
        await preorder_allocation_service.cancel(item.preorder_allocation_id);
      }
    }
    await this.repo.clear_cart(cart_id);
    return this.get_cart_view(cart_id);
  }

  async admin_delete_cart(cart_id: string) {
    const cart = await this.repo.find_by_id(cart_id);
    if (!cart) throw_error(CART_ERROR.NOT_FOUND);
    const items = await this.repo.list_items(cart_id);
    for (const item of items) {
      await this.release_reservation_safely(item.reservation_id);
      if (item.preorder_allocation_id) {
        await preorder_allocation_service.cancel(item.preorder_allocation_id);
      }
    }
    await this.repo.delete_cart(cart_id);
    return { ok: true as const };
  }
}

export const cart_service = new CartService();
