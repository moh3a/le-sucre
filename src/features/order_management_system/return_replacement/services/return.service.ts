import "server-only";

import type { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { format } from "date-fns";

import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { order_repository } from "@/features/order_management_system/orders/repositories/order.repository";
import { orders } from "@/features/order_management_system/orders/schema";
import { build_order_number } from "@/features/order_management_system/orders/order-number.helper";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { RETURN_REPLACEMENT_ERROR } from "../constants/error-codes";
import { return_repository } from "../repositories/return.repository";
import { return_requests } from "../schema";
import type {
  create_return_request_dto,
  review_return_request_dto,
  receive_return_dto,
  complete_return_dto,
  cancel_return_request_dto,
  admin_list_return_requests_dto,
} from "../models/return.dto";

export class ReturnReplacementService {
  async create_request(
    input: z.infer<typeof create_return_request_dto> & { requested_by_user_id?: string | null },
  ) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(RETURN_REPLACEMENT_ERROR.ORDER_NOT_DELIVERED);
    if (order.status !== "delivered" && input.type !== "failed_delivery") {
      throw_error(RETURN_REPLACEMENT_ERROR.ORDER_NOT_DELIVERED);
    }

    const existing = await return_repository.find_pending_by_order(input.order_id);
    if (existing) throw_error(RETURN_REPLACEMENT_ERROR.ALREADY_HAS_PENDING_REQUEST);

    const id = generate_id();
    await return_repository.create({
      id,
      order_id: input.order_id,
      type: input.type,
      status: "pending",
      reason: input.reason,
      customer_note: input.customer_note ?? null,
      admin_note: null,
      items: input.items as ReturnRequestItems,
      replacement_order_id: null,
      refund_amount: null,
      requested_by_user_id: input.requested_by_user_id ?? null,
      reviewed_by_user_id: null,
      reviewed_at: null,
      completed_at: null,
      metadata: {},
    });

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: order.status,
      to_status: order.status,
      actor_user_id: input.requested_by_user_id ?? null,
      note: `Demande de ${get_type_label(input.type)} créée: ${input.reason.slice(0, 200)}`,
    });

    return return_repository.find_by_id(id);
  }

  async customer_create_request(
    input: z.infer<typeof create_return_request_dto> & { user_id: string },
  ) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(RETURN_REPLACEMENT_ERROR.ORDER_NOT_DELIVERED);
    if (order.user_id !== input.user_id) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);

    return this.create_request({
      ...input,
      requested_by_user_id: input.user_id,
    });
  }

  async review_request(
    input: z.infer<typeof review_return_request_dto> & { reviewed_by_user_id: string },
  ) {
    const request = await return_repository.find_by_id(input.id);
    if (!request) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);
    if (request.status !== "pending") {
      throw_error(RETURN_REPLACEMENT_ERROR.CANNOT_APPROVE);
    }

    const order = await order_repository.find_by_id(request.order_id);
    if (!order) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);

    const patch: Partial<typeof return_requests.$inferInsert> = {
      reviewed_by_user_id: input.reviewed_by_user_id,
      reviewed_at: new Date().toISOString(),
      admin_note: input.admin_note ?? null,
    };

    if (input.status === "approved" && input.refund_amount !== undefined) {
      patch.refund_amount = String(input.refund_amount);
    }

    if (input.status === "approved" && request.type === "replacement") {
      const original_order = await order_repository.find_by_id(request.order_id);
      if (!original_order) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);

      const subtotal = request.items.reduce(
        (s, i) => s + Number(i.unit_price) * i.quantity,
        0,
      );
      const new_order_id = generate_id();

      await order_repository.create_order({
        id: new_order_id,
        order_number: build_order_number(),
        user_id: original_order.user_id,
        guest_email: original_order.guest_email,
        guest_phone: original_order.guest_phone,
        cart_id: null,
        currency: original_order.currency,
        channel: "retail",
        status: "processing",
        payment_status: "paid",
        fulfillment_status: "unfulfilled",
        subtotal: String(subtotal),
        discount_total: "0",
        tax_total: "0",
        shipping_total: "0",
        grand_total: String(subtotal),
        shipping_address: original_order.shipping_address,
        billing_address: original_order.billing_address,
        idempotency_key: `replacement_${generate_id()}`,
        payment_provider: "manual",
        metadata: { replacement_of: request.order_id, return_request_id: request.id },
        notes: `Commande de remplacement pour ${original_order.order_number}`,
        placed_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      });

      const sku_ids = [...new Set(request.items.map((i) => i.sku_id))];
      const skus = await db
        .select({ id: product_skus.id, product_id: product_skus.product_id })
        .from(product_skus)
        .where(inArray(product_skus.id, sku_ids));

      const sku_map = new Map(skus.map((s) => [s.id, s.product_id]));

      const order_items_input = request.items.map((item) => ({
        id: generate_id(),
        order_id: new_order_id,
        sku_id: item.sku_id,
        product_id: sku_map.get(item.sku_id) ?? item.sku_id,
        sku_code: item.sku_code,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: (Number(item.unit_price) * item.quantity).toFixed(2),
        currency: original_order.currency,
        fulfillment_type: "standard" as const,
        payment_capture_mode: "full" as const,
      }));

      await order_repository.insert_items(order_items_input);

      await order_repository.insert_status_event({
        id: generate_id(),
        order_id: new_order_id,
        from_status: null,
        to_status: "processing",
        actor_user_id: input.reviewed_by_user_id,
        note: `Commande de remplacement créée depuis la demande ${request.id}`,
      });

      patch.replacement_order_id = new_order_id;

      await db
        .update(orders)
        .set({ fulfillment_status: "returned" })
        .where(eq(orders.id, request.order_id));
    }

    await return_repository.update_status(input.id, input.status, patch);

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: request.order_id,
      from_status: order.status,
      to_status: order.status,
      actor_user_id: input.reviewed_by_user_id,
      note: `Demande de ${get_type_label(request.type)} ${input.status === "approved" ? "approuvée" : "rejetée"}${input.admin_note ? `: ${input.admin_note}` : ""}`,
    });

    return return_repository.find_by_id(input.id);
  }

  async receive_items(
    input: z.infer<typeof receive_return_dto> & { user_id: string },
  ) {
    const request = await return_repository.find_by_id(input.id);
    if (!request) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);
    if (request.status !== "approved" && request.status !== "in_transit") {
      throw_error(RETURN_REPLACEMENT_ERROR.CANNOT_APPROVE);
    }

    const patch: Partial<typeof return_requests.$inferInsert> = {
      admin_note: input.admin_note ?? null,
    };

    await return_repository.update_status(input.id, "received", patch);

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: request.order_id,
      from_status: request.status,
      to_status: "received",
      actor_user_id: input.user_id,
      note: `Articles de ${get_type_label(request.type)} reçus${input.admin_note ? `: ${input.admin_note}` : ""}`,
    });

    return return_repository.find_by_id(input.id);
  }

  async complete_request(
    input: z.infer<typeof complete_return_dto> & { user_id: string },
  ) {
    const request = await return_repository.find_by_id(input.id);
    if (!request) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);
    if (request.status !== "received") {
      throw_error(RETURN_REPLACEMENT_ERROR.CANNOT_APPROVE);
    }

    const patch: Partial<typeof return_requests.$inferInsert> = {
      admin_note: input.admin_note ?? null,
      completed_at: new Date().toISOString(),
    };

    if (input.refund_amount !== undefined) {
      patch.refund_amount = String(input.refund_amount);
    }

    await return_repository.update_status(input.id, "completed", patch);

    // Update order fulfillment status to "returned"
    const order = await order_repository.find_by_id(request.order_id);
    if (order) {
      await db
        .update(orders)
        .set({ fulfillment_status: "returned" })
        .where(eq(orders.id, request.order_id));
    }

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: request.order_id,
      from_status: request.status,
      to_status: "completed",
      actor_user_id: input.user_id,
      note: `${get_type_label(request.type)} terminé${input.admin_note ? `: ${input.admin_note}` : ""}`,
    });

    return return_repository.find_by_id(input.id);
  }

  async cancel_request(
    input: z.infer<typeof cancel_return_request_dto> & { user_id: string },
  ) {
    const request = await return_repository.find_by_id(input.id);
    if (!request) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);
    if (request.status !== "pending" && request.status !== "approved") {
      throw_error(RETURN_REPLACEMENT_ERROR.CANNOT_CANCEL);
    }

    await return_repository.update_status(input.id, "cancelled", {
      admin_note: input.reason ?? null,
    });

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: request.order_id,
      from_status: request.status,
      to_status: "cancelled",
      actor_user_id: input.user_id,
      note: `Demande de ${get_type_label(request.type)} annulée${input.reason ? `: ${input.reason}` : ""}`,
    });

    return return_repository.find_by_id(input.id);
  }

  async list_by_order(order_id: string) {
    return await return_repository.find_by_order(order_id);
  }

  async customer_list_by_order(order_id: string, user_id: string) {
    const order = await order_repository.find_by_id(order_id);
    if (!order) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);
    if (order.user_id !== user_id) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);
    return return_repository.find_by_order(order_id);
  }

  async get_request(id: string) {
    const request = await return_repository.find_by_id(id);
    if (!request) throw_error(RETURN_REPLACEMENT_ERROR.NOT_FOUND);
    return request;
  }

  async admin_list(input: z.infer<typeof admin_list_return_requests_dto>) {
    return await return_repository.admin_list(
      input.page,
      input.limit,
      input.status,
      input.type,
    );
  }
}

function get_type_label(type: string): string {
  const labels: Record<string, string> = {
    return: "retour",
    replacement: "remplacement",
    failed_delivery: "livraison échouée",
  };
  return labels[type] ?? type;
}

type ReturnRequestItems = Array<{
  sku_id: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  unit_price: string;
  condition?: string;
}>;

export const return_service = new ReturnReplacementService();
