import "server-only";

import { and, eq } from "drizzle-orm";
import type { z } from "zod";

import type {
  place_order_dto,
  list_orders_dto,
  admin_update_order_status_dto,
} from "../models/order.dto";
import { order_repository } from "../repositories/order.repository";
import { build_order_number } from "../order-number.helper";
import { assert_order_transition } from "../order-lifecycle.engine";
import { cart_items, carts } from "../../schema";
import { checkout_engine } from "../../checkout/checkout.engine";
import { preorder_allocation_service } from "../../preorders/services/preorder-allocation.service";
import { FULFILLMENT_TYPE, PREORDER_LINE_STATUS } from "../../preorders/constants/preorder-status";
import { preorder_repository } from "../../preorders/repositories/preorder.repository";
import { promo_code_repository } from "../../promotions/repositories/promo-code.repository";
import { track_promotion_redemption } from "../../promotions/analytics/promotion-analytics.hook";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { user_repository } from "@/features/authentication_and_authorization/auth/repositories/user.repository";
import { event_ingestion_service } from "@/features/analytics_management_system/services/event-ingestion.service";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
import { reservation_service } from "@/features/inventory_management_system/inventory/services/reservation.service";
import { db } from "@/lib/db";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/error_handling";
import { generate_id } from "@/lib/utils";
import { format } from "date-fns";

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
      placed_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });

    // const item_inserts = await Promise.all(
    //   items.map(async (line) => {
    //     const [sku] = await db
    //       .select({ sku_code: product_skus.sku_code })
    //       .from(product_skus)
    //       .where(eq(product_skus.id, line.sku_id))
    //       .limit(1);

    //     const [tr] = await db
    //       .select({ name: product_translations.name })
    //       .from(product_translations)
    //       .where(
    //         and(
    //           eq(product_translations.product_id, line.product_id),
    //           eq(product_translations.locale, "fr"),
    //         ),
    //       )
    //       .limit(1);

    //     return {
    //       id: generate_id(),
    //       order_id,
    //       sku_id: line.sku_id,
    //       product_id: line.product_id,
    //       sku_code: sku?.sku_code ?? line.sku_id,
    //       product_name: tr?.name ?? line.product_id,
    //       quantity: line.quantity,
    //       unit_price: String(line.unit_price),
    //       line_total: (Number(line.unit_price) * line.quantity).toFixed(2),
    //       currency: line.currency,
    //       reservation_id: line.reservation_id ?? null,
    //     };
    //   }),
    // );

    // await this.repo.insert_items(item_inserts);

    // await this.repo.insert_adjustments(
    //   totals.adjustments.map((a) => ({
    //     id: generate_id(),
    //     order_id,
    //     type: a.type,
    //     label: a.label,
    //     amount: a.amount.startsWith("-") ? a.amount.slice(1) : a.amount,
    //     currency: cart.currency,
    //   })),
    // );

    // await this.repo.insert_status_event({
    //   id: generate_id(),
    //   order_id,
    //   from_status: null,
    //   to_status: "pending_payment",
    //   note: "Commande créée",
    // });

    // // TODO
    // // For preorder lines:
    // // Do not commit inventory reservation.
    // // confirm preorder allocation + set order_items.preorder_status = pending_stock.
    // // Payment: if deposit_percent < 100, set payment_capture_mode = "deposit" and order payment_status = "partially_paid" until balance capture.

    // for (const line of items) {
    //   if (!line.reservation_id) continue;
    //   await reservation_service.commit({ id: line.reservation_id, order_id });
    // }
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

        const fulfillment_type = line.fulfillment_type ?? FULFILLMENT_TYPE.standard;
        const is_preorder_line =
          fulfillment_type === FULFILLMENT_TYPE.preorder ||
          fulfillment_type === FULFILLMENT_TYPE.backorder;

        let deposit_percent = 100;
        if (is_preorder_line) {
          const settings = await preorder_repository.get_settings(line.sku_id);
          deposit_percent = Number(settings?.deposit_percent ?? 100);
        }

        const item_id = generate_id();

        return {
          id: item_id,
          order_id,
          sku_id: line.sku_id,
          product_id: line.product_id,
          sku_code: sku?.sku_code ?? line.sku_id,
          product_name: tr?.name ?? line.product_id,
          quantity: line.quantity,
          unit_price: String(line.unit_price),
          line_total: (Number(line.unit_price) * line.quantity).toFixed(2),
          currency: line.currency,
          reservation_id: is_preorder_line ? null : (line.reservation_id ?? null),
          fulfillment_type,
          preorder_status: is_preorder_line ? PREORDER_LINE_STATUS.pending_stock : null,
          estimated_available_at: null as string | null,
          preorder_allocation_id: line.preorder_allocation_id ?? null,
          payment_capture_mode: deposit_percent < 100 ? "deposit" : "full",
          _deposit_percent: deposit_percent,
          _confirm_allocation: is_preorder_line ? line.preorder_allocation_id : null,
        };
      }),
    );

    const normalized_items = item_inserts.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ _deposit_percent, _confirm_allocation, ...row }) => row,
    );
    await this.repo.insert_items(normalized_items);

    if (input.discount_code) {
      const code_row = await promo_code_repository.find_by_code(input.discount_code);
      if (code_row) {
        await promo_code_repository.increment_usage(code_row.id);
        await track_promotion_redemption({
          promotion_id: code_row.promotion_id,
          promo_code_id: code_row.id,
          order_id,
          user_id: input.user_id ?? null,
          discount_amount: totals.discount_total,
        });
      }
    }

    let has_deposit_lines = false;
    for (const raw of item_inserts) {
      if (raw._confirm_allocation) {
        await preorder_allocation_service.confirm_for_order(
          raw._confirm_allocation,
          order_id,
          raw.id,
        );
      }
      if (raw.payment_capture_mode === "deposit") has_deposit_lines = true;

      if (raw.reservation_id) {
        await reservation_service.commit({ id: raw.reservation_id, order_id });
      }
    }

    if (has_deposit_lines) {
      await this.repo.update_order_status(order_id, "pending_payment", {
        payment_status: "partially_paid",
      });
    }

    await db.update(carts).set({ status: "converted" }).where(eq(carts.id, input.cart_id));
    void audit_service.log({
      action: "order.place_from_cart",
      resource_type: "cart_id",
      resource_id: input.cart_id,
    });

    // [ ] example: track purchase event
    // [ ] TODO: implement in all relevant places
    void event_ingestion_service.track_purchase({
      order_id,
      user_id: input.user_id,
      revenue: totals.grand_total,
      lines: item_inserts.map((i) => ({
        product_id: i.product_id,
        sku_id: i.sku_id,
        quantity: i.quantity,
      })),
    });

    return this.repo.get_full(order_id);
  }

  async list_for_customer(user_id: string, input: z.infer<typeof list_orders_dto>) {
    return await this.repo.list_for_customer(user_id, input.page, input.limit, input.status);
  }

  async admin_list_by_product(product_id: string, page: number, limit: number) {
    return await this.repo.admin_list_by_product(product_id, page, limit);
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
      ...(input.status === "cancelled" ? { cancelled_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") } : {}),
    });

    await this.repo.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: current.status,
      to_status: input.status,
      actor_user_id: input.actor_user_id,
      note: input.note ?? null,
    });

    void audit_service.log({
      action: "order.status.transition",
      resource_type: "order_id",
      resource_id: input.order_id,
    });
    return this.repo.get_full(input.order_id);
  }

  async assign_operator(input: {
    order_id: string;
    operator_id: string | null;
    actor_user_id: string;
  }) {
    const current = await this.repo.find_by_id(input.order_id);
    if (!current) throw new NotFoundError("Commande introuvable");

    const old_operator_id = current.assigned_operator_id;
    if (old_operator_id !== input.operator_id) {
      let old_name = "Non assigné";
      let new_name = "Non assigné";

      if (old_operator_id) {
        const old_user = await user_repository.find_by_id(old_operator_id);
        if (old_user) old_name = old_user.name;
      }
      if (input.operator_id) {
        const new_user = await user_repository.find_by_id(input.operator_id);
        if (new_user) new_name = new_user.name;
      }

      let note = "";
      if (!old_operator_id && input.operator_id) {
        note = `Opérateur assigné : ${new_name}`;
      } else if (old_operator_id && !input.operator_id) {
        note = `Opérateur désassigné (précédemment : ${old_name})`;
      } else {
        note = `Opérateur modifié : de ${old_name} à ${new_name}`;
      }

      await this.repo.update_order_assignment(input.order_id, {
        assigned_operator_id: input.operator_id,
      });

      await this.repo.insert_status_event({
        id: generate_id(),
        order_id: input.order_id,
        from_status: current.status,
        to_status: current.status,
        actor_user_id: input.actor_user_id,
        note,
      });
    }

    void audit_service.log({
      actor_user_id: input.actor_user_id,
      action: "order.assign_operator",
      resource_type: "order_id",
      resource_id: input.order_id,
      metadata: { operator_id: input.operator_id ?? undefined },
    });

    return this.repo.get_full(input.order_id);
  }

  async assign_delivery_person(input: {
    order_id: string;
    delivery_person_id: string | null;
    actor_user_id: string;
  }) {
    const current = await this.repo.find_by_id(input.order_id);
    if (!current) throw new NotFoundError("Commande introuvable");

    const old_delivery_id = current.assigned_delivery_person_id;
    if (old_delivery_id !== input.delivery_person_id) {
      let old_name = "Non assigné";
      let new_name = "Non assigné";

      if (old_delivery_id) {
        const old_user = await user_repository.find_by_id(old_delivery_id);
        if (old_user) old_name = old_user.name;
      }
      if (input.delivery_person_id) {
        const new_user = await user_repository.find_by_id(input.delivery_person_id);
        if (new_user) new_name = new_user.name;
      }

      let note = "";
      if (!old_delivery_id && input.delivery_person_id) {
        note = `Livreur assigné : ${new_name}`;
      } else if (old_delivery_id && !input.delivery_person_id) {
        note = `Livreur désassigné (précédemment : ${old_name})`;
      } else {
        note = `Livreur modifié : de ${old_name} à ${new_name}`;
      }

      await this.repo.update_order_assignment(input.order_id, {
        assigned_delivery_person_id: input.delivery_person_id,
      });

      await this.repo.insert_status_event({
        id: generate_id(),
        order_id: input.order_id,
        from_status: current.status,
        to_status: current.status,
        actor_user_id: input.actor_user_id,
        note,
      });
    }

    void audit_service.log({
      actor_user_id: input.actor_user_id,
      action: "order.assign_delivery_person",
      resource_type: "order_id",
      resource_id: input.order_id,
      metadata: { delivery_person_id: input.delivery_person_id ?? undefined },
    });

    return this.repo.get_full(input.order_id);
  }

  async update_notes(input: {
    order_id: string;
    notes: string | null;
    actor_user_id: string;
  }) {
    const current = await this.repo.find_by_id(input.order_id);
    if (!current) throw new NotFoundError("Commande introuvable");

    await this.repo.update_notes(input.order_id, input.notes);

    await this.repo.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: current.status,
      to_status: current.status,
      actor_user_id: input.actor_user_id,
      note: input.notes ? "Notes mises à jour" : "Notes supprimées",
    });

    void audit_service.log({
      actor_user_id: input.actor_user_id,
      action: "order.update_notes",
      resource_type: "order_id",
      resource_id: input.order_id,
    });

    return this.repo.get_full(input.order_id);
  }
}

export const order_service = new OrderService();
