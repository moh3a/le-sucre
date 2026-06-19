import { z } from "zod";
import { create_trpc_router } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { customer_relations_service } from "../services/customer-relations.service";

export const customer_relations_router = create_trpc_router({
  customerLogContact: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string().nullable().optional(), order_id: z.string().nullable().optional(), contact_type: z.enum(["phone_call", "whatsapp", "sms", "email"]), direction: z.enum(["inbound", "outbound"]), subject: z.string().optional(), summary: z.string().optional(), duration_seconds: z.coerce.number().int().optional() }))
    .mutation(({ ctx, input }) => customer_relations_service.log_contact({ ...input, handled_by_user_id: ctx.session!.user.id })),

  customerGetContacts: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }))
    .query(({ input }) => customer_relations_service.get_contacts(input.user_id, input.page, input.limit)),

  customerGetContactsByOrder: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ order_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_contacts_by_order(input.order_id)),

  customerAddNote: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string(), note_type: z.enum(["private", "operator", "follow_up"]).default("private"), content: z.string().min(1).max(4096) }))
    .mutation(({ ctx, input }) => customer_relations_service.add_note({ ...input, created_by_user_id: ctx.session!.user.id })),

  customerGetNotes: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string(), note_type: z.string().optional() }))
    .query(({ input }) => customer_relations_service.get_notes(input.user_id, input.note_type)),

  customerTogglePinNote: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ note_id: z.string(), is_pinned: z.boolean() }))
    .mutation(({ input }) => customer_relations_service.toggle_pin(input.note_id, input.is_pinned)),

  customerCreateFollowUp: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ user_id: z.string().nullable().optional(), order_id: z.string().nullable().optional(), follow_up_type: z.enum(["callback", "follow_up", "reminder"]), title: z.string().min(1).max(255), description: z.string().optional(), assigned_to_user_id: z.string().optional(), priority: z.enum(["low", "normal", "high", "urgent"]).optional(), scheduled_at: z.string() }))
    .mutation(({ ctx, input }) => customer_relations_service.create_follow_up({ ...input, created_by_user_id: ctx.session!.user.id })),

  customerCompleteFollowUp: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string(), result_notes: z.string().optional() }))
    .mutation(({ ctx, input }) => customer_relations_service.complete_follow_up({ ...input, completed_by_user_id: ctx.session!.user.id })),

  customerCancelFollowUp: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => customer_relations_service.cancel_follow_up({ ...input, cancelled_by_user_id: ctx.session!.user.id })),

  customerListMyFollowUps: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ status: z.string().optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) }))
    .query(({ ctx, input }) => customer_relations_service.list_my_follow_ups(ctx.session!.user.id, input.status, input.page, input.limit)),

  customerGetOverdueFollowUps: permission_procedure(PERMISSIONS.orders_read)
    .query(() => customer_relations_service.get_overdue_follow_ups()),

  customerGetFollowUpsByUser: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_follow_ups_by_user(input.user_id)),

  customerCreateCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ user_id: z.string().nullable().optional(), order_id: z.string().nullable().optional(), subject: z.string().min(1).max(255), description: z.string().min(1), category: z.string().default("general"), priority: z.enum(["low", "normal", "high", "urgent"]).optional(), assigned_to_user_id: z.string().optional() }))
    .mutation(({ ctx, input }) => customer_relations_service.create_case({ ...input, created_by_user_id: ctx.session!.user.id })),

  customerAssignCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), assigned_to_user_id: z.string() }))
    .mutation(({ ctx, input }) => customer_relations_service.assign_case({ ...input, assigned_by_user_id: ctx.session!.user.id })),

  customerResolveCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), resolution: z.string() }))
    .mutation(({ ctx, input }) => customer_relations_service.resolve_case({ ...input, resolved_by_user_id: ctx.session!.user.id })),

  customerReopenCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), reason: z.string() }))
    .mutation(({ ctx, input }) => customer_relations_service.reopen_case({ ...input, reopened_by_user_id: ctx.session!.user.id })),

  customerCloseCase: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string() }))
    .mutation(({ ctx, input }) => customer_relations_service.close_case({ ...input, closed_by_user_id: ctx.session!.user.id })),

  customerGetCase: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ case_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_case(input.case_id)),

  customerListCases: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: z.string().optional(), assigned_to: z.string().optional() }))
    .query(({ input }) => customer_relations_service.list_cases(input.page, input.limit, input.status, input.assigned_to)),

  customerGetCasesByUser: permission_procedure(PERMISSIONS.customers_read)
    .input(z.object({ user_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_cases_by_user(input.user_id)),

  customerAddCaseMessage: permission_procedure(PERMISSIONS.orders_write)
    .input(z.object({ case_id: z.string(), message: z.string(), is_internal: z.boolean().default(false) }))
    .mutation(({ ctx, input }) => customer_relations_service.add_case_message({ ...input, author_user_id: ctx.session!.user.id })),

  customerGetCaseMessages: permission_procedure(PERMISSIONS.orders_read)
    .input(z.object({ case_id: z.string() }))
    .query(({ input }) => customer_relations_service.get_case_messages(input.case_id)),
});
