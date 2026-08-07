import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/error_handling";
import { throw_error } from "@/features/fulfillment_management_system/shared/error-codes";
import { CHECKOUT_ERROR } from "./constants/error-codes";
import {
  find_shipping_method,
  resolve_shipping_cost,
} from "./constants/shipping-methods";
import { is_checkout_payment_method } from "./constants/payment-methods";
import { carts, cart_items } from "../schema";
import { checkout_engine } from "./checkout.engine";
import { order_service } from "../orders/services/order.service";
import type { checkout_preview_dto, place_order_dto } from "../orders/models/order.dto";
import type { address_snapshot_dto } from "../orders/models/address.dto";
import { event_ingestion_service } from "@/features/marketing/analytics/services/event-ingestion.service";
import { resolve_unit_price } from "@/features/product_information_management/variants/engines/pricing.engine";
import { cart_discount_service } from "../promotions/services/cart-discount.service";

const SUPPORTED_COUNTRY_CODES = new Set(["DZ"]);

export class CheckoutService {
  private async assert_cart_owned(cart_id: string, user_id?: string | null) {
    const [cart] = await db.select().from(carts).where(eq(carts.id, cart_id)).limit(1);
    if (!cart || cart.status !== "active") throw_error(CHECKOUT_ERROR.CART_NOT_FOUND);
    if (cart.user_id && cart.user_id !== (user_id ?? null)) {
      throw_error(CHECKOUT_ERROR.CART_NOT_FOUND);
    }
    return cart;
  }

  private validate_addresses(input: {
    shipping_address?: z.infer<typeof address_snapshot_dto> | null;
    billing_address?: z.infer<typeof address_snapshot_dto> | null;
  }) {
    if (input.shipping_address && !SUPPORTED_COUNTRY_CODES.has(input.shipping_address.country_code)) {
      throw_error(CHECKOUT_ERROR.INVALID_SHIPPING_ADDRESS);
    }
    if (input.billing_address && !SUPPORTED_COUNTRY_CODES.has(input.billing_address.country_code)) {
      throw_error(CHECKOUT_ERROR.INVALID_BILLING_ADDRESS);
    }
  }

  private async assert_promo_applies(input: {
    cart_id: string;
    discount_code?: string | null;
    shipping_cost: number;
    user_id?: string | null;
  }) {
    if (!input.discount_code) return;
    const items = await db.select().from(cart_items).where(eq(cart_items.cart_id, input.cart_id));
    if (!items.length) return;

    const result = await cart_discount_service.apply({
      lines: items.map((i) => ({
        sku_id: i.sku_id,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: String(i.unit_price),
        line_total: (Number(i.unit_price) * i.quantity).toFixed(2),
      })),
      user_id: input.user_id ?? null,
      promo_code: input.discount_code,
      shipping_cost: input.shipping_cost,
    });

    const applied_any = (result.applied?.length ?? 0) > 0 || result.free_shipping;
    if (!applied_any) throw_error(CHECKOUT_ERROR.PROMO_CODE_INVALID);
  }

  private async assert_prices_current(cart_id: string) {
    const items = await db.select().from(cart_items).where(eq(cart_items.cart_id, cart_id));
    for (const line of items) {
      let current;
      try {
        current = await resolve_unit_price({
          sku_id: line.sku_id,
          product_id: line.product_id,
          quantity: line.quantity,
          channel: "retail",
          currency: line.currency,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw_error(CHECKOUT_ERROR.ITEMS_UNAVAILABLE);
        }
        throw error;
      }
      if (Number(current.unit_price) !== Number(line.unit_price)) {
        throw_error(CHECKOUT_ERROR.PRICES_CHANGED);
      }
    }
  }

  async preview(
    input: z.infer<typeof checkout_preview_dto> & {
      cart_id: string;
      user_id?: string | null;
    },
  ) {
    const cart = await this.assert_cart_owned(input.cart_id, input.user_id);

    const shipping_method = find_shipping_method(input.shipping_method);
    if (input.shipping_method && !shipping_method) {
      throw_error(CHECKOUT_ERROR.SHIPPING_METHOD_UNAVAILABLE);
    }
    const shipping_cost = resolve_shipping_cost(
      input.shipping_method,
      input.shipping_cost ?? 0,
    );

    const items = await db.select().from(cart_items).where(eq(cart_items.cart_id, input.cart_id));
    if (!items.length) throw_error(CHECKOUT_ERROR.CART_EMPTY);

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
      shipping_cost,
      tax_rate: input.tax_rate,
      user_id: input.user_id ?? null,
    });

    void event_ingestion_service.track({
      event_type: "checkout_started",
      cart_id: input.cart_id,
      user_id: input.user_id,
    });

    return {
      cart_id: input.cart_id,
      currency: cart.currency,
      items_count: items.length,
      shipping_method: shipping_method?.id ?? null,
      totals,
    };
  }

  async place(
    input: z.infer<typeof place_order_dto> & { cart_id: string; user_id?: string | null },
  ) {
    await this.assert_cart_owned(input.cart_id, input.user_id);

    const shipping_method = find_shipping_method(input.shipping_method);
    if (input.shipping_method && !shipping_method) {
      throw_error(CHECKOUT_ERROR.SHIPPING_METHOD_UNAVAILABLE);
    }
    if (!is_checkout_payment_method(input.payment_provider)) {
      throw_error(CHECKOUT_ERROR.PAYMENT_METHOD_UNAVAILABLE);
    }

    const billing_address = input.billing_address ?? input.shipping_address;
    this.validate_addresses({
      shipping_address: input.shipping_address,
      billing_address,
    });
    await this.assert_prices_current(input.cart_id);

    const shipping_cost = resolve_shipping_cost(
      input.shipping_method,
      input.shipping_cost ?? 0,
    );
    await this.assert_promo_applies({
      cart_id: input.cart_id,
      discount_code: input.discount_code,
      shipping_cost,
      user_id: input.user_id,
    });

    return await order_service.place_from_cart({
      ...input,
      billing_address,
      shipping_cost,
    });
  }
}

export const checkout_service = new CheckoutService();
