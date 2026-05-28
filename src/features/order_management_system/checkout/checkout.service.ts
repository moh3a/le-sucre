import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/error_handling";
import { carts, cart_items } from "../schema";
import { checkout_engine } from "./checkout.engine";
import { order_service } from "../orders/order.service";
import type { checkout_preview_dto, place_order_dto } from "../orders/models/order.dto";

export class CheckoutService {
  async preview(
    input: z.infer<typeof checkout_preview_dto> & {
      cart_id: string;
      user_id?: string | null;
    },
  ) {
    const [cart] = await db.select().from(carts).where(eq(carts.id, input.cart_id)).limit(1);
    if (!cart) throw new NotFoundError("Panier introuvable");

    if (input.user_id && cart.user_id && cart.user_id !== input.user_id) {
      throw new ValidationError("Ce panier n'appartient pas à cet utilisateur");
    }

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
      shipping_cost: input.shipping_cost ?? 0,
      tax_rate: input.tax_rate,
    });

    return {
      cart_id: input.cart_id,
      currency: cart.currency,
      items_count: items.length,
      totals,
    };
  }

  place(input: z.infer<typeof place_order_dto> & { cart_id: string; user_id?: string | null }) {
    return order_service.place_from_cart(input);
  }
}

export const checkout_service = new CheckoutService();
