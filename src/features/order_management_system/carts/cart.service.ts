import "server-only";
import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
import { resolve_unit_price } from "@/features/product_information_management/variants/engines/pricing.engine";
import { reservation_service } from "@/features/inventory_management_system/inventory/services/reservation.service";
import { carts } from "../schema";
import type { add_cart_item_dto } from "./models/cart.dto";
import { cart_repository } from "./repository";
import { availability_service } from "../preorders/services/availability.service";
import { preorder_allocation_service } from "../preorders/services/preorder-allocation.service";
import { event_ingestion_service } from "@/features/analytics_management_system/services/event-ingestion.service";

const RESERVE_TTL_SEC = 900;

export class CartService {
  constructor(private readonly repo = cart_repository) {}

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
    const items = await this.repo.list_items(cart_id);
    const enriched = await Promise.all(
      items.map(async (item) => {
        const [tr] = await db
          .select({ name: product_translations.name })
          .from(product_translations)
          .where(
            and(
              eq(product_translations.product_id, item.product_id),
              eq(product_translations.locale, locale),
            ),
          )
          .limit(1);
        return {
          ...item,
          product_name: tr?.name ?? item.sku_id,
          line_total: (Number(item.unit_price) * item.quantity).toFixed(2),
        };
      }),
    );
    const subtotal = enriched.reduce((s, i) => s + Number(i.line_total), 0).toFixed(2);
    return { cart_id, items: enriched, subtotal, currency: items[0]?.currency ?? "DZD" };
  }

  async add_item(cart_id: string, input: z.infer<typeof add_cart_item_dto>) {
    const [sku] = await db
      .select()
      .from(product_skus)
      .where(eq(product_skus.id, input.sku_id))
      .limit(1);
    if (!sku || !sku.is_active) throw new NotFoundError("SKU introuvable");

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
    } else {
      throw new ConflictError("Produit indisponible");
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
    if (!item) throw new NotFoundError("Ligne panier introuvable");
    if (item.reservation_id) await reservation_service.release(item.reservation_id);
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
    } else {
      throw new ConflictError("Produit indisponible");
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
    if (item.reservation_id) await reservation_service.release(item.reservation_id);
    if (item.preorder_allocation_id) {
      await preorder_allocation_service.cancel(item.preorder_allocation_id);
    }
    await this.repo.delete_item(item_id);
    return this.get_cart_view(cart_id);
  }

  /** On login: merge guest lines into user cart */
  async merge_guest_into_user(guest_cart_id: string, user_id: string) {
    const user_cart = await this.get_or_create_cart({ user_id });
    const guest_items = await this.repo.list_items(guest_cart_id);
    for (const line of guest_items) {
      await this.add_item(user_cart.id, { sku_id: line.sku_id, quantity: line.quantity });
      if (line.reservation_id) await reservation_service.release(line.reservation_id);
    }
    await db.update(carts).set({ status: "merged" }).where(eq(carts.id, guest_cart_id));
    return user_cart.id;
  }
}

export const cart_service = new CartService();
