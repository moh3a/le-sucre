import "server-only";

import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { SHIPPING_ERROR } from "../../constants/error-codes";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { order_repository } from "@/features/order_management_system/orders/repositories/order.repository";
import { shipping_repository } from "@/features/shipping_management_system/repository";
import { delivery_repository as repo } from "../repositories/delivery.repository";

export class DeliveryService {
  async log_attempt(input: {
    shipment_id: string;
    order_id: string;
    status: string;
    description?: string;
    delivery_person_id?: string;
    attempted_at?: string;
    next_attempt_at?: string;
  }) {
    const valid_statuses = [
      "successful",
      "failed",
      "customer_unavailable",
      "wrong_address",
      "refused",
      "cancelled",
    ];
    if (!valid_statuses.includes(input.status)) {
      throw_error(SHIPPING_ERROR.DELIVERY_INVALID_STATUS);
    }

    const shipment = await shipping_repository.find_shipment(input.shipment_id);
    if (!shipment) throw_error(SHIPPING_ERROR.SHIPMENT_NOT_FOUND);

    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(SHIPPING_ERROR.ORDER_NOT_FOUND);

    if (input.status === "successful" && shipment.delivery_status === "delivered") {
      throw_error(SHIPPING_ERROR.DELIVERY_ALREADY_DELIVERED);
    }

    const existing_attempts = await repo.get_attempts_by_shipment(input.shipment_id);
    const attempt_number = existing_attempts.length + 1;
    const id = await repo.insert_attempt({
      id: generate_id(),
      shipment_id: input.shipment_id,
      order_id: input.order_id,
      attempt_number,
      status: input.status,
      description: input.description ?? null,
      delivery_person_id: input.delivery_person_id ?? null,
      attempted_at: input.attempted_at ?? new Date().toISOString(),
      next_attempt_at: input.next_attempt_at ?? null,
    });

    if (input.status === "successful") {
      await shipping_repository.update_shipment(input.shipment_id, { delivery_status: "delivered" });
      await order_repository.update_order_status(input.order_id, "delivered", {
        fulfillment_status: "fulfilled",
      });
    } else if (
      ["failed", "customer_unavailable", "wrong_address", "refused"].includes(input.status)
    ) {
      await shipping_repository.update_shipment(input.shipment_id, { delivery_status: "failed" });
    }

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: "shipped",
      to_status: input.status === "successful" ? "delivered" : "failed_delivery",
      actor_user_id: input.delivery_person_id ?? null,
      note: `Attempt #${attempt_number}: ${input.description ?? input.status}`,
    });

    return id;
  }

  async get_attempts_by_order(order_id: string) {
    return repo.get_attempts_by_order(order_id);
  }

  async get_attempts_by_shipment(shipment_id: string) {
    return repo.get_attempts_by_shipment(shipment_id);
  }

  async retry_delivery(input: { order_id: string; scheduled_at: string; delivery_person_id?: string }) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(SHIPPING_ERROR.ORDER_NOT_FOUND);

    if (order.status !== "failed_delivery") {
      throw_error(SHIPPING_ERROR.DELIVERY_CANCELLED_NO_RETRY);
    }

    await order_repository.update_order_status(input.order_id, "processing");
    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: "failed_delivery",
      to_status: "processing",
      actor_user_id: input.delivery_person_id ?? null,
      note: "Delivery rescheduled",
    });
  }

  async return_to_warehouse(input: {
    order_id: string;
    initiated_by_user_id: string;
    reason?: string;
  }) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(SHIPPING_ERROR.ORDER_NOT_FOUND);

    await order_repository.update_order_status(input.order_id, "failed_delivery", {
      fulfillment_status: "returned",
    });
    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: "failed_delivery",
      to_status: "failed_delivery",
      actor_user_id: input.initiated_by_user_id,
      note: `Return to warehouse: ${input.reason ?? "Delivery impossible"}`,
    });
  }

  async get_failed_delivery_count(since?: string) {
    return repo.count_failed_deliveries(since);
  }

  async list_attempts(page = 1, limit = 20, status?: string, delivery_person_id?: string) {
    return repo.list_attempts(page, limit, status, delivery_person_id);
  }

  async get_stats() {
    return repo.get_stats();
  }
}

export const delivery_service = new DeliveryService();
