import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import {
  permission_procedure,
  storefront_procedure,
} from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { order_operations_service } from "../services/order-operations.service";
import { customer_relations_service } from "../services/customer-relations.service";
import { delivery_service } from "../services/delivery.service";
import { warranty_service } from "../services/warranty.service";
import { inventory_adjustment_service } from "../services/inventory-adjustment.service";
import { product_workflow_service } from "../services/product-workflow.service";
import { promotion_review_service } from "../services/promotion-review.service";
import { payment_operations_service } from "../services/payment-operations.service";
import { admin_task_service } from "../services/admin-task.service";
import { notification_service } from "../services/notification.service";

export const operations_router = create_trpc_router({
  // ═══════════════════════════════════════════
  // ORDER OPERATIONS
  // ═══════════════════════════════════════════

  // ─── ASSIGNMENT ───────────────────────────
  orderAssignOperator: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ order_id: z.string(), operator_id: z.string(), note: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      order_operations_service.assign_operator({ ...input, actor_user_id: ctx.session!.user.id }),
    ),

  orderGetAssignmentHistory: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_assignment_history(input.order_id)),

  // ─── ESCALATION ───────────────────────────
  orderEscalate: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        reason: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        assigned_to_user_id: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_operations_service.escalate({ ...input, escalated_by_user_id: ctx.session!.user.id }),
    ),

  orderResolveEscalation: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        id: z.string(),
        resolution: z.string(),
        status: z.enum(["resolved", "dismissed"]).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_operations_service.resolve_escalation({ ...input, resolved_by_user_id: ctx.session!.user.id }),
    ),

  orderGetEscalations: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_escalations(input.order_id)),

  orderListEscalations: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => order_operations_service.list_escalations(input.page, input.limit, input.status)),

  // ─── HOLD ─────────────────────────────────
  orderPlaceOnHold: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        reason: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_operations_service.place_on_hold({ ...input, held_by_user_id: ctx.session!.user.id }),
    ),

  orderReleaseHold: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ hold_id: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      order_operations_service.release_hold({ ...input, released_by_user_id: ctx.session!.user.id }),
    ),

  orderGetHolds: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_holds(input.order_id)),

  // ─── CANCELLATION ─────────────────────────
  orderRequestCancellation: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        reason: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_operations_service.request_cancellation({
        ...input,
        requested_by_user_id: ctx.session!.user.id,
      }),
    ),

  orderReviewCancellation: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        cancellation_request_id: z.string(),
        status: z.enum(["approved", "rejected"]),
        review_note: z.string().optional(),
        refund_amount: z.coerce.number().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_operations_service.review_cancellation({
        ...input,
        reviewed_by_user_id: ctx.session!.user.id,
      }),
    ),

  orderGetCancellationRequests: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_cancellation_requests(input.order_id)),

  orderListCancellationRequests: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => order_operations_service.list_cancellation_requests(input.page, input.limit, input.status)),

  // ─── COMMENTS ─────────────────────────────
  orderAddComment: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        content: z.string().min(1).max(4096),
        is_private: z.boolean().default(true),
      }),
    )
    .mutation(({ ctx, input }) =>
      order_operations_service.add_comment({ ...input, author_user_id: ctx.session!.user.id }),
    ),

  orderGetComments: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string(), include_private: z.boolean().default(true) }))
    .query(({ input }) => order_operations_service.get_comments(input.order_id, input.include_private)),

  // ─── TIMELINE ─────────────────────────────
  orderGetTimeline: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => order_operations_service.get_timeline(input.order_id)),

  // ═══════════════════════════════════════════
  // CUSTOMER RELATIONS
  // ═══════════════════════════════════════════

  // ─── CONTACTS ─────────────────────────────
  customerLogContact: permission_procedure(PERMISSIONS.customers_read)
    .input(
      z.object({
        user_id: z.string().nullable().optional(),
        order_id: z.string().nullable().optional(),
        contact_type: z.enum(["phone_call", "whatsapp", "sms", "email"]),
        direction: z.enum(["inbound", "outbound"]),
        subject: z.string().optional(),
        summary: z.string().optional(),
        duration_seconds: z.coerce.number().int().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      customer_relations_service.log_contact({ ...input, handled_by_user_id: ctx.session!.user.id }),
    ),

  customerGetContacts: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }))
    .query(({ input }) => customer_relations_service.get_contacts(input.user_id, input.page, input.limit)),

  customerGetContactsByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_contacts_by_order(input.order_id)),

  // ─── NOTES ────────────────────────────────
  customerAddNote: permission_procedure(PERMISSIONS.customers_read)
    .input(
      z.object({
        user_id: z.string(),
        note_type: z.enum(["private", "operator", "follow_up"]).default("private"),
        content: z.string().min(1).max(4096),
      }),
    )
    .mutation(({ ctx, input }) =>
      customer_relations_service.add_note({ ...input, created_by_user_id: ctx.session!.user.id }),
    ),

  customerGetNotes: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string(), note_type: z.string().optional() }))
    .query(({ input }) => customer_relations_service.get_notes(input.user_id, input.note_type)),

  customerTogglePinNote: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ note_id: z.string(), is_pinned: z.boolean() }))
    .mutation(({ input }) => customer_relations_service.toggle_pin(input.note_id, input.is_pinned)),

  // ─── FOLLOW-UPS ───────────────────────────
  customerCreateFollowUp: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        user_id: z.string().nullable().optional(),
        order_id: z.string().nullable().optional(),
        follow_up_type: z.enum(["callback", "follow_up", "reminder"]),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        assigned_to_user_id: z.string().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        scheduled_at: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      customer_relations_service.create_follow_up({ ...input, created_by_user_id: ctx.session!.user.id }),
    ),

  customerCompleteFollowUp: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), result_notes: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      customer_relations_service.complete_follow_up({ ...input, completed_by_user_id: ctx.session!.user.id }),
    ),

  customerCancelFollowUp: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      customer_relations_service.cancel_follow_up({ ...input, cancelled_by_user_id: ctx.session!.user.id }),
    ),

  customerListMyFollowUps: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        status: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ ctx, input }) =>
      customer_relations_service.list_my_follow_ups(ctx.session!.user.id, input.status, input.page, input.limit),
    ),

  customerGetOverdueFollowUps: permission_procedure(PERMISSIONS.orders_read).query(() =>
    customer_relations_service.get_overdue_follow_ups(),
  ),

  customerGetFollowUpsByUser: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_follow_ups_by_user(input.user_id)),

  // ─── SUPPORT CASES ────────────────────────
  customerCreateCase: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        user_id: z.string().nullable().optional(),
        order_id: z.string().nullable().optional(),
        subject: z.string().min(1).max(255),
        description: z.string().min(1),
        category: z.string().default("general"),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        assigned_to_user_id: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      customer_relations_service.create_case({ ...input, created_by_user_id: ctx.session!.user.id }),
    ),

  customerAssignCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), assigned_to_user_id: z.string() }))
    .mutation(({ ctx, input }) =>
      customer_relations_service.assign_case({ ...input, assigned_by_user_id: ctx.session!.user.id }),
    ),

  customerResolveCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), resolution: z.string() }))
    .mutation(({ ctx, input }) =>
      customer_relations_service.resolve_case({ ...input, resolved_by_user_id: ctx.session!.user.id }),
    ),

  customerReopenCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), reason: z.string() }))
    .mutation(({ ctx, input }) =>
      customer_relations_service.reopen_case({ ...input, reopened_by_user_id: ctx.session!.user.id }),
    ),

  customerCloseCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string() }))
    .mutation(({ ctx, input }) =>
      customer_relations_service.close_case({ ...input, closed_by_user_id: ctx.session!.user.id }),
    ),

  customerGetCase: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ case_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_case(input.case_id)),

  customerListCases: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
        assigned_to: z.string().optional(),
      }),
    )
    .query(({ input }) => customer_relations_service.list_cases(input.page, input.limit, input.status, input.assigned_to)),

  customerGetCasesByUser: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_cases_by_user(input.user_id)),

  customerAddCaseMessage: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), message: z.string(), is_internal: z.boolean().default(false) }))
    .mutation(({ ctx, input }) =>
      customer_relations_service.add_case_message({ ...input, author_user_id: ctx.session!.user.id }),
    ),

  customerGetCaseMessages: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ case_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_case_messages(input.case_id)),

  // ═══════════════════════════════════════════
  // DELIVERY OPERATIONS
  // ═══════════════════════════════════════════

  deliveryLogAttempt: permission_procedure(PERMISSIONS.delivery_manage)
    .input(
      z.object({
        shipment_id: z.string(),
        order_id: z.string(),
        status: z.enum(["successful", "failed", "customer_unavailable", "wrong_address", "refused", "cancelled"]),
        description: z.string().optional(),
        attempted_at: z.string().optional(),
        next_attempt_at: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      delivery_service.log_attempt({ ...input, delivery_person_id: ctx.session!.user.id }),
    ),

  deliveryGetAttemptsByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => delivery_service.get_attempts_by_order(input.order_id)),

  deliveryGetAttemptsByShipment: permission_procedure(PERMISSIONS.shipping_read)
    .input(z.object({ shipment_id: z.string() }))
    .query(({ input }) => delivery_service.get_attempts_by_shipment(input.shipment_id)),

  deliveryRetry: permission_procedure(PERMISSIONS.delivery_manage)
    .input(z.object({ order_id: z.string(), scheduled_at: z.string() }))
    .mutation(({ ctx, input }) =>
      delivery_service.retry_delivery({ ...input, delivery_person_id: ctx.session!.user.id }),
    ),

  deliveryReturnToWarehouse: permission_procedure(PERMISSIONS.delivery_manage)
    .input(z.object({ order_id: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      delivery_service.return_to_warehouse({ ...input, initiated_by_user_id: ctx.session!.user.id }),
    ),

  deliveryListAttempts: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
        delivery_person_id: z.string().optional(),
      }),
    )
    .query(({ input }) => delivery_service.list_attempts(input.page, input.limit, input.status, input.delivery_person_id)),

  deliveryGetStats: permission_procedure(PERMISSIONS.orders_read).query(() => delivery_service.get_stats()),

  // ═══════════════════════════════════════════
  // WARRANTY
  // ═══════════════════════════════════════════

  warrantyCreate: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        order_item_id: z.string().optional(),
        product_id: z.string(),
        sku_id: z.string(),
        user_id: z.string().optional(),
        issue_type: z.string(),
        description: z.string(),
        technician_user_id: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      warranty_service.create({ ...input, user_id: input.user_id ?? ctx.session!.user.id }),
    ),

  warrantyReview: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["approved", "rejected", "under_review"]),
        technician_user_id: z.string().optional(),
        technician_notes: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      warranty_service.review({ ...input, reviewed_by_user_id: ctx.session!.user.id }),
    ),

  warrantyResolve: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        id: z.string(),
        resolution_type: z.enum(["repair", "replace", "refund", "none"]),
        resolution_notes: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      warranty_service.resolve({ ...input, resolved_by_user_id: ctx.session!.user.id }),
    ),

  warrantyGet: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => warranty_service.get(input.id)),

  warrantyListByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => warranty_service.list_by_order(input.order_id)),

  warrantyList: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => warranty_service.list(input.page, input.limit, input.status)),

  warrantyStats: permission_procedure(PERMISSIONS.orders_read).query(() => warranty_service.stats()),

  // ═══════════════════════════════════════════
  // INVENTORY ADJUSTMENTS
  // ═══════════════════════════════════════════

  inventoryRequestAdjustment: permission_procedure(PERMISSIONS.inventory_write)
    .input(
      z.object({
        sku_id: z.string(),
        warehouse_id: z.string().optional(),
        adjustment_type: z.enum(["increase", "decrease", "damage", "loss", "correction"]),
        quantity_delta: z.coerce.number().int(),
        current_on_hand: z.coerce.number().int(),
        expected_on_hand: z.coerce.number().int(),
        reason: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      inventory_adjustment_service.request_adjustment({ ...input, requested_by_user_id: ctx.session!.user.id }),
    ),

  inventoryReviewAdjustment: permission_procedure(PERMISSIONS.inventory_write)
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["approved", "rejected", "cancelled"]),
        review_note: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      inventory_adjustment_service.review({ ...input, reviewed_by_user_id: ctx.session!.user.id }),
    ),

  inventoryListAdjustmentRequests: permission_procedure(PERMISSIONS.inventory_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => inventory_adjustment_service.list(input.page, input.limit, input.status)),

  inventoryAdjustmentStats: permission_procedure(PERMISSIONS.inventory_read).query(() =>
    inventory_adjustment_service.stats(),
  ),

  // ═══════════════════════════════════════════
  // PRODUCT WORKFLOWS
  // ═══════════════════════════════════════════

  productGetChangeLog: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ product_id: z.string(), change_type: z.string().optional() }))
    .query(({ input }) => product_workflow_service.get_change_history(input.product_id, input.change_type)),

  productSchedulePublish: permission_procedure(PERMISSIONS.products_write)
    .input(
      z.object({
        product_id: z.string(),
        action: z.enum(["publish", "unpublish"]),
        scheduled_at: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      product_workflow_service.schedule_publishing({ ...input, created_by_user_id: ctx.session!.user.id }),
    ),

  productCancelSchedule: permission_procedure(PERMISSIONS.products_write)
    .input(z.object({ schedule_id: z.string(), reason: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      product_workflow_service.cancel_schedule({ ...input, cancelled_by_user_id: ctx.session!.user.id }),
    ),

  productGetScheduledActions: permission_procedure(PERMISSIONS.products_read)
    .input(z.object({ product_id: z.string().optional() }))
    .query(({ input }) => product_workflow_service.get_scheduled_actions(input.product_id)),

  productListScheduledActions: permission_procedure(PERMISSIONS.products_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => product_workflow_service.list_scheduled_actions(input.page, input.limit, input.status)),

  productGetScheduleStats: permission_procedure(PERMISSIONS.products_read).query(() =>
    product_workflow_service.get_schedule_stats(),
  ),

  // ═══════════════════════════════════════════
  // PROMOTION REVIEWS
  // ═══════════════════════════════════════════

  promotionRequestReview: permission_procedure(PERMISSIONS.promotions_write)
    .input(z.object({ promotion_id: z.string(), review_type: z.string() }))
    .mutation(({ ctx, input }) =>
      promotion_review_service.request_review({ ...input, requested_by_user_id: ctx.session!.user.id }),
    ),

  promotionReview: permission_procedure(PERMISSIONS.promotions_write)
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["approved", "rejected"]),
        review_note: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      promotion_review_service.review({ ...input, reviewer_user_id: ctx.session!.user.id }),
    ),

  promotionListPendingReviews: permission_procedure(PERMISSIONS.promotions_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ input }) => promotion_review_service.list_pending(input.page, input.limit)),

  promotionGetReviews: permission_procedure(PERMISSIONS.promotions_read)
    .input(z.object({ promotion_id: z.string() }))
    .query(({ input }) => promotion_review_service.get_by_promotion(input.promotion_id)),

  promotionCountPendingReviews: permission_procedure(PERMISSIONS.promotions_read).query(() =>
    promotion_review_service.count_pending(),
  ),

  promotionListReviews: permission_procedure(PERMISSIONS.promotions_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => promotion_review_service.list_reviews(input.page, input.limit, input.status)),

  promotionGetReviewStats: permission_procedure(PERMISSIONS.promotions_read).query(() =>
    promotion_review_service.get_review_stats(),
  ),

  // ═══════════════════════════════════════════
  // PAYMENT OPERATIONS
  // ═══════════════════════════════════════════

  paymentCreateVerification: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        amount: z.coerce.number(),
        currency: z.string().optional(),
        reference_number: z.string().optional(),
        proof_url: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      payment_operations_service.create_verification({ ...input, created_by_user_id: ctx.session!.user.id }),
    ),

  paymentVerify: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["verified", "rejected"]),
        rejection_reason: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      payment_operations_service.verify_payment({ ...input, verified_by_user_id: ctx.session!.user.id }),
    ),

  paymentListVerifications: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => payment_operations_service.list_verifications(input.page, input.limit, input.status)),

  paymentCountPendingVerifications: permission_procedure(PERMISSIONS.orders_read).query(() =>
    payment_operations_service.count_pending(),
  ),

  // ─── REFUNDS ──────────────────────────────
  paymentRequestRefund: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        amount: z.coerce.number(),
        reason: z.string(),
        return_request_id: z.string().optional(),
        cancellation_request_id: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      payment_operations_service.request_refund({ ...input, requested_by_user_id: ctx.session!.user.id }),
    ),

  paymentApproveRefund: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), refund_method: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      payment_operations_service.approve_refund({ ...input, approved_by_user_id: ctx.session!.user.id }),
    ),

  paymentProcessRefund: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        id: z.string(),
        provider_reference: z.string().optional(),
        status: z.enum(["completed", "failed"]).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      payment_operations_service.process_refund({ ...input, processed_by_user_id: ctx.session!.user.id }),
    ),

  paymentListRefundRequests: permission_procedure(PERMISSIONS.orders_read)
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) => payment_operations_service.list_refund_requests(input.page, input.limit, input.status)),

  paymentGetRefundByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => payment_operations_service.get_refund_by_order(input.order_id)),

  // ─── PARTIAL PAYMENTS ─────────────────────
  paymentRecordPartial: permission_procedure(PERMISSIONS.orders_write)
    .input(
      z.object({
        order_id: z.string(),
        payment_number: z.coerce.number().int(),
        type: z.enum(["deposit", "installment", "balance"]),
        amount: z.coerce.number(),
        currency: z.string().optional(),
        payment_method: z.string().optional(),
        payment_reference: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(({ input }) => payment_operations_service.record_partial_payment(input)),

  paymentGetPartialPayments: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => payment_operations_service.get_partial_payments(input.order_id)),

  paymentCheckDeposit: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => payment_operations_service.check_deposit_completed(input.order_id)),

  // ═══════════════════════════════════════════
  // ADMIN TASKS
  // ═══════════════════════════════════════════

  adminTaskCreate: permission_procedure(PERMISSIONS.settings_write)
    .input(
      z.object({
        task_type: z.enum(["order_follow_up", "customer_follow_up", "inventory_review", "campaign_review", "general"]),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        reference_type: z.string().optional(),
        reference_id: z.string().optional(),
        assigned_to_user_id: z.string().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        due_at: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      admin_task_service.create({ ...input, created_by_user_id: ctx.session!.user.id }),
    ),

  adminTaskUpdate: permission_procedure(PERMISSIONS.settings_write)
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        due_at: z.string().optional(),
        assigned_to_user_id: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      admin_task_service.update({ ...input, updated_by_user_id: ctx.session!.user.id }),
    ),

  adminTaskAssign: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string(), assigned_to_user_id: z.string() }))
    .mutation(({ ctx, input }) =>
      admin_task_service.assign({ ...input, assigned_by_user_id: ctx.session!.user.id }),
    ),

  adminTaskStart: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => admin_task_service.start_task({ ...input, user_id: ctx.session!.user.id })),

  adminTaskComplete: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string(), completion_notes: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      admin_task_service.complete({ ...input, completed_by_user_id: ctx.session!.user.id }),
    ),

  adminTaskCancel: permission_procedure(PERMISSIONS.settings_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => admin_task_service.cancel({ ...input, cancelled_by_user_id: ctx.session!.user.id })),

  adminTaskGet: permission_procedure(PERMISSIONS.settings_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => admin_task_service.get(input.id)),

  adminTaskListMine: permission_procedure(PERMISSIONS.settings_read)
    .input(
      z.object({
        status: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ ctx, input }) => admin_task_service.list_for_user(ctx.session!.user.id, input.status, input.page, input.limit)),

  adminTaskListAll: permission_procedure(PERMISSIONS.settings_read)
    .input(
      z.object({
        status: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
    )
    .query(({ input }) => admin_task_service.list_all(input.status, input.page, input.limit)),

  adminTaskGetOverdue: permission_procedure(PERMISSIONS.settings_read).query(() => admin_task_service.get_overdue()),

  adminTaskDashboard: permission_procedure(PERMISSIONS.settings_read).query(({ ctx }) =>
    admin_task_service.get_dashboard_stats(ctx.session!.user.id),
  ),

  // ═══════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════

  notificationList: storefront_procedure
    .input(
      z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        unread_only: z.boolean().default(false),
      }),
    )
    .query(({ ctx, input }) =>
      notification_service.list(ctx.session!.user.id, input.page, input.limit, input.unread_only),
    ),

  notificationMarkAsRead: storefront_procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => notification_service.mark_as_read(input.id, ctx.session!.user.id)),

  notificationMarkAllAsRead: storefront_procedure.mutation(({ ctx }) =>
    notification_service.mark_all_as_read(ctx.session!.user.id),
  ),

  notificationCountUnread: storefront_procedure.query(({ ctx }) => notification_service.count_unread(ctx.session!.user.id)),
});

export const operations_router_for_merge = operations_router;
