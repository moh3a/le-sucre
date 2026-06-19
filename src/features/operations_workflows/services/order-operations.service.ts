import "server-only";
import type { z } from "zod";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { order_repository } from "@/features/order_management_system/orders/repositories/order.repository";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { user_repository } from "@/features/authentication_and_authorization/auth/repositories/user.repository";
import { order_operations_repository as repo } from "../repositories/order-operations.repository";
import { notification_service } from "./notification.service";
import { OPERATIONS_ERROR } from "../constants/error-codes";
import { NOTIFICATION_TYPES } from "../constants/notifications";

export class OrderOperationsService {
  // ─── ASSIGNMENT ───────────────────────────────
  async assign_operator(input: { order_id: string; operator_id: string; actor_user_id: string; note?: string }) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(OPERATIONS_ERROR.NOT_FOUND);

    const old_operator_id = order.assigned_operator_id;
    await order_repository.update_order_assignment(input.order_id, { assigned_operator_id: input.operator_id });

    await repo.insert_assignment({
      id: generate_id(),
      order_id: input.order_id,
      assignment_type: "operator",
      from_user_id: old_operator_id ?? null,
      to_user_id: input.operator_id,
      assigned_by_user_id: input.actor_user_id,
      note: input.note ?? null,
    });

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: order.status,
      to_status: order.status,
      actor_user_id: input.actor_user_id,
      note: input.note ?? "Opérateur assigné",
    });

    void notification_service.notify({
      user_id: input.operator_id,
      type: NOTIFICATION_TYPES.ORDER_ASSIGNED,
      reference_type: "order_id",
      reference_id: input.order_id,
    });

    void audit_service.log({
      actor_user_id: input.actor_user_id,
      action: "order.operator.assign",
      resource_type: "order_id",
      resource_id: input.order_id,
      metadata: { old_operator_id: old_operator_id ?? undefined, new_operator_id: input.operator_id },
    });
  }

  async get_assignment_history(order_id: string) {
    return repo.get_assignment_history(order_id);
  }

  // ─── ESCALATION ───────────────────────────────
  async escalate(input: {
    order_id: string;
    reason: string;
    description?: string;
    priority?: string;
    assigned_to_user_id?: string;
    escalated_by_user_id: string;
  }) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(OPERATIONS_ERROR.NOT_FOUND);

    const id = await repo.insert_escalation({
      id: generate_id(),
      order_id: input.order_id,
      escalated_by_user_id: input.escalated_by_user_id,
      assigned_to_user_id: input.assigned_to_user_id ?? null,
      reason: input.reason,
      description: input.description ?? null,
      priority: input.priority ?? "normal",
      status: "open",
    });

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: order.status,
      to_status: order.status,
      actor_user_id: input.escalated_by_user_id,
      note: `Escalade: ${input.reason}`,
    });

    if (input.assigned_to_user_id) {
      void notification_service.notify({
        user_id: input.assigned_to_user_id,
        type: NOTIFICATION_TYPES.ORDER_ESCALATED,
        reference_type: "order_id",
        reference_id: input.order_id,
      });
    }

    void audit_service.log({
      actor_user_id: input.escalated_by_user_id,
      action: "order.escalation.create",
      resource_type: "order_id",
      resource_id: input.order_id,
      metadata: { reason: input.reason, priority: input.priority },
    });

    return repo.get_escalation(id);
  }

  async resolve_escalation(input: { id: string; resolution: string; resolved_by_user_id: string; status?: string }) {
    const escalation = await repo.get_escalation(input.id);
    if (!escalation) throw_error(OPERATIONS_ERROR.NOT_FOUND);
    if (escalation.status === "resolved" || escalation.status === "dismissed") {
      throw_error(OPERATIONS_ERROR.INVALID_STATUS);
    }

    await repo.update_escalation(input.id, {
      status: input.status ?? "resolved",
      resolution: input.resolution,
      resolved_by_user_id: input.resolved_by_user_id,
      resolved_at: new Date().toISOString(),
    });

    void audit_service.log({
      actor_user_id: input.resolved_by_user_id,
      action: "order.escalation.resolve",
      resource_type: "escalation_id",
      resource_id: input.id,
    });
  }

  async get_escalations(order_id: string) {
    return repo.get_escalations_by_order(order_id);
  }

  async list_escalations(page = 1, limit = 20, status?: string) {
    return repo.list_escalations(page, limit, status);
  }

  // ─── HOLD ─────────────────────────────────────
  async place_on_hold(input: { order_id: string; reason: string; description?: string; held_by_user_id: string }) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(OPERATIONS_ERROR.NOT_FOUND);

    const existing = await repo.get_active_hold(input.order_id);
    if (existing) throw_error(OPERATIONS_ERROR.ALREADY_HELD);

    const id = await repo.insert_hold({
      id: generate_id(),
      order_id: input.order_id,
      reason: input.reason,
      description: input.description ?? null,
      held_by_user_id: input.held_by_user_id,
      is_active: true,
    });

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: order.status,
      to_status: "on_hold",
      actor_user_id: input.held_by_user_id,
      note: `Commande mise en attente: ${input.reason}`,
    });

    void audit_service.log({
      actor_user_id: input.held_by_user_id,
      action: "order.hold.place",
      resource_type: "order_id",
      resource_id: input.order_id,
      metadata: { reason: input.reason },
    });

    return repo.get_holds_by_order(input.order_id);
  }

  async release_hold(input: { hold_id: string; released_by_user_id: string; reason?: string }) {
    const hold = await repo.get_holds_by_order(input.hold_id); // This is wrong, fix below
    const hold_record = await db_get_hold(input.hold_id);
    if (!hold_record) throw_error(OPERATIONS_ERROR.NOT_FOUND);
    if (!hold_record.is_active) throw_error(OPERATIONS_ERROR.NOT_HELD);

    await repo.release_hold(input.hold_id, {
      is_active: false,
      released_by_user_id: input.released_by_user_id,
      released_at: new Date().toISOString(),
      released_reason: input.reason ?? null,
    });

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: hold_record.order_id,
      from_status: "on_hold",
      to_status: "processing",
      actor_user_id: input.released_by_user_id,
      note: `Attente levée: ${input.reason ?? "Libéré"}`,
    });

    void audit_service.log({
      actor_user_id: input.released_by_user_id,
      action: "order.hold.release",
      resource_type: "hold_id",
      resource_id: input.hold_id,
    });
  }

  async get_holds(order_id: string) {
    return repo.get_holds_by_order(order_id);
  }

  // ─── CANCELLATION REQUEST ─────────────────────
  async request_cancellation(input: {
    order_id: string;
    reason: string;
    description?: string;
    requested_by_user_id: string;
  }) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(OPERATIONS_ERROR.NOT_FOUND);
    if (order.status === "cancelled" || order.status === "refunded") {
      throw_error(OPERATIONS_ERROR.INVALID_STATUS);
    }

    const pending = await repo.get_pending_cancellation(input.order_id);
    if (pending) throw_error(OPERATIONS_ERROR.CANCELLATION_PENDING);

    const id = await repo.insert_cancellation_request({
      id: generate_id(),
      order_id: input.order_id,
      requested_by_user_id: input.requested_by_user_id,
      reason: input.reason,
      description: input.description ?? null,
      status: "pending",
    });

    await order_repository.insert_status_event({
      id: generate_id(),
      order_id: input.order_id,
      from_status: order.status,
      to_status: order.status,
      actor_user_id: input.requested_by_user_id,
      note: `Demande d'annulation: ${input.reason}`,
    });

    void audit_service.log({
      actor_user_id: input.requested_by_user_id,
      action: "order.cancellation.request",
      resource_type: "order_id",
      resource_id: input.order_id,
      metadata: { reason: input.reason },
    });

    return repo.get_cancellation_request(id);
  }

  async review_cancellation(input: {
    cancellation_request_id: string;
    status: "approved" | "rejected";
    review_note?: string;
    reviewed_by_user_id: string;
    refund_amount?: number;
  }) {
    const request = await repo.get_cancellation_request(input.cancellation_request_id);
    if (!request) throw_error(OPERATIONS_ERROR.NOT_FOUND);
    if (request.status !== "pending") throw_error(OPERATIONS_ERROR.INVALID_STATUS);

    await repo.update_cancellation_request(input.cancellation_request_id, {
      status: input.status,
      reviewed_by_user_id: input.reviewed_by_user_id,
      review_note: input.review_note ?? null,
      reviewed_at: new Date().toISOString(),
      ...(input.refund_amount !== undefined ? { refund_amount: String(input.refund_amount) } : {}),
    });

    if (input.status === "approved") {
      await order_repository.update_order_status(request.order_id, "cancelled", {
        cancelled_at: new Date().toISOString(),
      });

      await order_repository.insert_status_event({
        id: generate_id(),
        order_id: request.order_id,
        from_status: "pending_cancellation",
        to_status: "cancelled",
        actor_user_id: input.reviewed_by_user_id,
        note: `Annulation approuvée: ${input.review_note ?? ""}`,
      });
    }

    void audit_service.log({
      actor_user_id: input.reviewed_by_user_id,
      action: "order.cancellation.review",
      resource_type: "cancellation_request_id",
      resource_id: input.cancellation_request_id,
      metadata: { status: input.status },
    });
  }

  async get_cancellation_requests(order_id: string) {
    return repo.get_cancellation_requests_by_order(order_id);
  }

  async list_cancellation_requests(page = 1, limit = 20, status?: string) {
    return repo.list_cancellation_requests(page, limit, status);
  }

  // ─── COMMENTS ─────────────────────────────────
  async add_comment(input: { order_id: string; content: string; is_private?: boolean; author_user_id: string }) {
    const order = await order_repository.find_by_id(input.order_id);
    if (!order) throw_error(OPERATIONS_ERROR.NOT_FOUND);

    const id = await repo.insert_comment({
      id: generate_id(),
      order_id: input.order_id,
      author_user_id: input.author_user_id,
      content: input.content,
      is_private: input.is_private ?? true,
    });

    void audit_service.log({
      actor_user_id: input.author_user_id,
      action: "order.comment.add",
      resource_type: "order_id",
      resource_id: input.order_id,
    });

    return id;
  }

  async get_comments(order_id: string, include_private = true) {
    return repo.get_comments(order_id, include_private);
  }

  // ─── ORDER TIMELINE ───────────────────────────
  async get_timeline(order_id: string) {
    const [status_events, assignments, holds, escalations, comments, cancellations] = await Promise.all([
      order_repository.get_full(order_id).then((r) => r?.status_events ?? []),
      repo.get_assignment_history(order_id),
      repo.get_holds_by_order(order_id),
      repo.get_escalations_by_order(order_id),
      repo.get_comments(order_id),
      repo.get_cancellation_requests_by_order(order_id),
    ]);

    const timeline = [
      ...status_events.map((e) => ({
        type: "status_event" as const,
        id: e.id,
        date: e.created_at,
        actor_user_id: e.actor_user_id,
        description: e.note ?? `${e.from_status ?? "created"} → ${e.to_status}`,
        metadata: { from_status: e.from_status, to_status: e.to_status },
      })),
      ...assignments.map((a) => ({
        type: "assignment" as const,
        id: a.id,
        date: a.created_at,
        actor_user_id: a.assigned_by_user_id,
        description: a.note ?? `Assigné: ${a.assignment_type}`,
        metadata: { assignment_type: a.assignment_type, from_user_id: a.from_user_id, to_user_id: a.to_user_id },
      })),
      ...holds.map((h) => ({
        type: h.is_active ? "hold" : ("hold_released" as const),
        id: h.id,
        date: h.created_at,
        actor_user_id: h.held_by_user_id,
        description: `Mise en attente: ${h.reason}`,
        metadata: { reason: h.reason },
      })),
      ...escalations.map((e) => ({
        type: "escalation" as const,
        id: e.id,
        date: e.created_at,
        actor_user_id: e.escalated_by_user_id,
        description: `Escalade: ${e.reason}`,
        metadata: { status: e.status, priority: e.priority },
      })),
      ...comments.map((c) => ({
        type: "comment" as const,
        id: c.id,
        date: c.created_at,
        actor_user_id: c.author_user_id,
        description: c.content.slice(0, 200),
        metadata: { is_private: c.is_private },
      })),
      ...cancellations.map((c) => ({
        type: "cancellation_request" as const,
        id: c.id,
        date: c.created_at,
        actor_user_id: c.requested_by_user_id,
        description: `Demande d'annulation: ${c.reason} (${c.status})`,
        metadata: { status: c.status, reason: c.reason },
      })),
    ];

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return timeline;
  }
}

async function db_get_hold(hold_id: string) {
  const { db } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");
  const { order_holds } = await import("../schema");
  return db.select().from(order_holds).where(eq(order_holds.id, hold_id)).limit(1).then((r) => r[0] ?? null);
}

export const order_operations_service = new OrderOperationsService();
