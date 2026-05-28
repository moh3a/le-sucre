import "server-only";

import { and, eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
import { carts, cart_items } from "../schema";
import { checkout_engine } from "../checkout/checkout.engine";
import { reservation_service } from "@/features/inventory_management_system/services/reservation.service";
import { assert_order_transition } from "./order-lifecycle.engine";
import { build_order_number } from "./order-number.helper";
import { order_repository } from "./repository";
import type {
  place_order_dto,
  list_orders_dto,
  admin_update_order_status_dto,
} from "./models/order.dto";

export class OrderService {
  constructor(private readonly repo = order_repository) {}

  async place_from_cart(
    input: z.infer<typeof place_order_dto> & { cart_id: string; user_id?: string | null },
  ) {
    const existing = await this.repo.find_by_idempotency(input.idempotency_key);
    if (existing) return this.repo.get_full(existing.id);

    const [cart] = await db.select().from(carts).where(eq(carts.id, input.cart_id)).limit(1);
    if (!cart || cart.status !== "active") throw new NotFoundError("Panier introuvable ou inactif");

    const items = await db.select().from(cart_items).where(eq(cart_items.cart_id, input.cart_id));
    if (!items.length) throw new ValidationError("Panier vide");

    const lines = items.map((i) => ({
      sku_id: i.sku_id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: String(i.unit_price),
      line_total: (Number(i.unit_price) * i.quantity).toFixed(2),
    }));

    const totals = await checkout_engine.compute({
      lines,
      discount_code: input.discount_code,
      shipping_cost: input.shipping_cost,
      tax_rate: input.tax_rate,
    });

    const order_id = await this.repo.create_order({
      id: generate_id(),
      order_number: build_order_number(),
      user_id: input.user_id ?? null,
      guest_email: input.user_id ? null : (input.guest_email ?? null),
      cart_id: input.cart_id,
      currency: cart.currency,
      channel: cart.channel,
      status: "pending_payment",
      payment_status: "pending",
      fulfillment_status: "unfulfilled",
      subtotal: totals.subtotal,
      discount_total: totals.discount_total,
      tax_total: totals.tax_total,
      shipping_total: totals.shipping_total,
      grand_total: totals.grand_total,
      shipping_address: input.shipping_address,
      billing_address: input.billing_address ?? null,
      idempotency_key: input.idempotency_key,
      payment_provider: input.payment_provider ?? null,
      placed_at: new Date().toISOString(),
    });

    const item_inserts = await Promise.all(
      items.map(async (line) => {
        const [sku] = await db
          .select({ sku_code: product_skus.sku_code })
          .from(product_skus)
          .where(eq(product_skus.id, line.sku_id))
          .limit(1);

        const [tr] = await db
          .select({ name: product_translations.name })
          .from(product_translations)
          .where(
            and(
              eq(product_translations.product_id, line.product_id),
              eq(product_translations.locale, "fr"),
            ),
          )
          .limit(1);

        return {
          id: generate_id(),
          order_id,
          sku_id: line.sku_id,
          product_id: line.product_id,
          sku_code: sku?.sku_code ?? line.sku_id,
          product_name: tr?.name ?? line.product_id,
          quantity: line.quantity,
          unit_price: String(line.unit_price),
          line_total: (Number(line.unit_price) * line.quantity).toFixed(2),
          currency: line.currency,
          reservation_id: line.reservation_id ?? null,
        };
      }),
    );

    await this.repo.insert_items(item_inserts);

    await this.repo.insert_adjustments(
      totals.adjustments.map((a) => ({
        id: generate_id(),
        order_id,
        type: a.type,
        label: a.label,
        amount: a.amount.startsWith("-") ? a.amount.slice(1) : a.amount,
        currency: cart.currency,
      })),
    );

    await this.repo.insert_status_event({
      id: generate_id(),
      order_id,
      from_status: null,
      to_status: "pending_payment",
      note: "Commande créée",
    });

    for (const line of items) {
      if (!line.reservation_id) continue;
      await reservation_service.commit({ id: line.reservation_id, order_id });
    }

    await db.update(carts).set({ status: "converted" }).where(eq(carts.id, input.cart_id));

    return this.repo.get_full(order_id);
  }

  list_for_customer(user_id: string, input: z.infer<typeof list_orders_dto>) {
    return this.repo.list_for_customer(user_id, input.page, input.limit, input.status);
  }

  async get_customer_detail(order_id: string, user_id: string) {
    const data = await this.repo.get_full(order_id);
    if (!data) throw new NotFoundError("Commande introuvable");
    if (data.order.user_id !== user_id) throw new ForbiddenError("Accès refusé");
    return data;
  }

  async get_guest_detail(order_id: string, guest_email: string) {
    const data = await this.repo.get_full(order_id);
    if (!data) throw new NotFoundError("Commande introuvable");
    if (!data.order.guest_email || data.order.guest_email !== guest_email) {
      throw new ForbiddenError("Accès refusé");
    }
    return data;
  }

  admin_list(input: z.infer<typeof list_orders_dto>) {
    return this.repo.admin_list(input.page, input.limit, input.status);
  }

  async admin_get(order_id: string) {
    const data = await this.repo.get_full(order_id);
    if (!data) throw new NotFoundError("Commande introuvable");
    return data;
  }

  async transition_status(
    input: z.infer<typeof admin_update_order_status_dto> & { actor_user_id: string },
  ) {
    const current = await this.repo.find_by_id(input.order_id);
    if (!current) throw new NotFoundError("Commande introuvable");

    assert_order_transition(current.status, input.status);

    await this.repo.update_order_status(input.order_id, input.status, {
      ...(input.status === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}),
    });

    await this.repo.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: current.status,
      to_status: input.status,
      actor_user_id: input.actor_user_id,
      note: input.note ?? null,
    });

    return this.repo.get_full(input.order_id);
  }
}

export const order_service = new OrderService();
