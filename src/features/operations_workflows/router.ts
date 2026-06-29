import { z } from "zod";
import { create_trpc_router, public_procedure } from "@/lib/trpc/router";
import { permission_procedure } from "@/features/authentication_and_authorization/authorization/middleware/rbac";
import { PERMISSIONS } from "@/features/authentication_and_authorization/authorization/constants/permissions";
import { approval_workflow_service } from "./services/approval-workflow.service";
import { sla_engine_service } from "./services/sla-engine.service";
import { order_routing_service } from "./services/order-routing.service";
import { procurement_service } from "./services/procurement.service";
import { inventory_transfer_service } from "./services/inventory-transfer.service";
import { payment_reconciliation_service } from "./services/payment-reconciliation.service";
import { fraud_review_service } from "./services/fraud-review.service";
import { rma_service } from "./services/rma.service";
import { agent_kpi_service } from "./services/agent-kpi.service";

export const operations_workflows_router = create_trpc_router({
  // ─── Approval Workflows ────────────────────────────────────────────────────

  approvalWorkflowsList: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => approval_workflow_service.list_workflows()),

  approvalWorkflowCreate: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      name: z.string().min(1).max(255),
      entity_type: z.string().min(1).max(64),
      steps: z.array(z.object({ order: z.number(), role: z.string(), label: z.string() })),
    }))
    .mutation(({ input }) => approval_workflow_service.create_workflow(input)),

  approvalRequestsList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ entity_type: z.string().optional() }).optional())
    .query(({ input }) => approval_workflow_service.get_pending_requests(input?.entity_type)),

  approvalSubmit: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      entity_type: z.string().min(1).max(64),
      entity_id: z.string().min(1).max(255),
      notes: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(({ input, ctx }) =>
      approval_workflow_service.submit_for_approval({
        ...input,
        requested_by_user_id: ctx.session?.user?.id ?? "",
      }),
    ),

  approvalApproveStep: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ request_id: z.string(), comment: z.string().optional() }))
    .mutation(({ input, ctx }) =>
      approval_workflow_service.approve_step({
        ...input,
        user_id: ctx.session?.user?.id ?? "",
      }),
    ),

  approvalReject: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ request_id: z.string(), comment: z.string().optional() }))
    .mutation(({ input, ctx }) =>
      approval_workflow_service.reject({
        ...input,
        user_id: ctx.session?.user?.id ?? "",
      }),
    ),

  approvalGetRequest: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => approval_workflow_service.get_request(input.id)),

  // ─── SLA ───────────────────────────────────────────────────────────────────

  slaDefinitionsList: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => sla_engine_service.get_stats().then(() => db_select_sla_definitions())),

  slaCreateDefinition: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      entity_type: z.string(), priority: z.string(),
      response_hours: z.number(), resolution_hours: z.number(),
      escalation_minutes: z.number(), escalate_to_role: z.string().optional(),
    }))
    .mutation(({ input }) => sla_engine_service.create_definition(input)),

  slaOverdueList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ entity_type: z.string().optional() }).optional())
    .query(({ input }) => sla_engine_service.get_overdue_list(input?.entity_type)),

  slaStats: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => sla_engine_service.get_stats()),

  slaTrackingForEntity: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ entity_type: z.string(), entity_id: z.string() }))
    .query(({ input }) => sla_engine_service.get_tracking_for_entity(input.entity_type, input.entity_id)),

  // ─── Order Routing ─────────────────────────────────────────────────────────

  routingRulesList: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => order_routing_service.list_rules()),

  routingRuleCreate: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      name: z.string(), priority: z.number(),
      conditions: z.array(z.object({ field: z.string(), operator: z.string(), value: z.string() })),
      assign_to_user_id: z.string().optional(), assign_to_role: z.string().optional(),
    }))
    .mutation(({ input }) => order_routing_service.create_rule(input)),

  routingRuleToggle: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string(), is_active: z.boolean() }))
    .mutation(({ input }) => order_routing_service.toggle_rule(input.id, input.is_active)),

  routingRuleDelete: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => order_routing_service.delete_rule(input.id)),

  routingAssignBatch: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ limit: z.number().default(20) }))
    .mutation(({ input }) => order_routing_service.assign_batch(input.limit)),

  // ─── Procurement ───────────────────────────────────────────────────────────

  suppliersList: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => procurement_service.list_suppliers()),

  supplierCreate: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      name: z.string(), code: z.string(),
      contact_name: z.string().optional(), email: z.string().optional(),
      phone: z.string().optional(), address: z.string().optional(),
      payment_terms: z.string().optional(), currency: z.string().optional(),
    }))
    .mutation(({ input }) => procurement_service.create_supplier(input)),

  supplierGet: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => procurement_service.get_supplier(input.id)),

  supplierUpdate: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      id: z.string(), name: z.string().optional(), code: z.string().optional(),
      contact_name: z.string().optional(), email: z.string().optional(),
      phone: z.string().optional(), address: z.string().optional(),
      payment_terms: z.string().optional(), currency: z.string().optional(),
    }))
    .mutation(({ input }) => procurement_service.update_supplier(input.id, input)),

  supplierLinkProduct: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      supplier_id: z.string(), product_id: z.string(), unit_cost: z.number(),
      supplier_sku: z.string().optional(), lead_time_days: z.number().optional(),
      min_order_qty: z.number().optional(), is_preferred: z.boolean().optional(),
    }))
    .mutation(({ input }) => procurement_service.link_product(input)),

  purchaseOrdersList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ status: z.string().optional() }).optional())
    .query(({ input }) => procurement_service.list_pos(input?.status)),

  purchaseOrderGet: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => procurement_service.get_po(input.id)),

  purchaseOrderCreate: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      supplier_id: z.string(), warehouse_id: z.string().optional(),
      items: z.array(z.object({ product_id: z.string(), quantity: z.number(), unit_cost: z.number() })),
      notes: z.string().optional(), expected_delivery_at: z.string().optional(),
    }))
    .mutation(({ input, ctx }) =>
      procurement_service.create_po({
        ...input,
        created_by_user_id: ctx.session?.user?.id ?? "",
      }),
    ),

  purchaseOrderSubmit: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => procurement_service.submit_po(input.id)),

  purchaseOrderApprove: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      procurement_service.approve_po(input.id, ctx.session?.user?.id ?? ""),
    ),

  purchaseOrderReceive: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      id: z.string(),
      items: z.array(z.object({ item_id: z.string(), received_qty: z.number() })),
    }))
    .mutation(({ input }) => procurement_service.receive_po(input.id, input.items)),

  // ─── Inventory Transfers ───────────────────────────────────────────────────

  inventoryTransfersList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ status: z.string().optional() }).optional())
    .query(({ input }) => inventory_transfer_service.list(input?.status)),

  inventoryTransferGet: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => inventory_transfer_service.get(input.id)),

  inventoryTransferCreate: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      source_warehouse_id: z.string(), destination_warehouse_id: z.string(),
      reason: z.string(), notes: z.string().optional(),
      items: z.array(z.object({ product_id: z.string(), quantity: z.number() })),
    }))
    .mutation(({ input, ctx }) =>
      inventory_transfer_service.create({ ...input, created_by_user_id: ctx.session?.user?.id ?? "" }),
    ),

  inventoryTransferApprove: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      inventory_transfer_service.approve(input.id, ctx.session?.user?.id ?? ""),
    ),

  inventoryTransferShip: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => inventory_transfer_service.ship(input.id)),

  inventoryTransferReceive: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => inventory_transfer_service.receive(input.id)),

  inventoryTransferCancel: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(({ input }) => inventory_transfer_service.cancel(input.id, input.reason)),

  // ─── Payment Reconciliation ────────────────────────────────────────────────

  reconciliationList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ status: z.string().optional(), order_id: z.string().optional() }).optional())
    .query(({ input }) => payment_reconciliation_service.list(input?.status, input?.order_id)),

  reconciliationCreate: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      order_id: z.string(), amount: z.number(), fee: z.number().optional(),
      transaction_reference: z.string().optional(), bank_reference: z.string().optional(),
      payment_method: z.string().optional(),
    }))
    .mutation(({ input }) => payment_reconciliation_service.create_entry(input)),

  reconciliationMatch: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      id: z.string(), transaction_reference: z.string().optional(),
      bank_reference: z.string().optional(), notes: z.string().optional(),
    }))
    .mutation(({ input, ctx }) =>
      payment_reconciliation_service.match({ ...input, user_id: ctx.session?.user?.id ?? "" }),
    ),

  reconciliationFlagDiscrepancy: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string(), notes: z.string() }))
    .mutation(({ input }) => payment_reconciliation_service.flag_discrepancy(input.id, input.notes)),

  reconciliationStats: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => payment_reconciliation_service.get_stats()),

  // ─── Fraud Review ──────────────────────────────────────────────────────────

  fraudReviewsList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ status: z.string().optional() }).optional())
    .query(({ input }) => fraud_review_service.list_all(input?.status)),

  fraudScreenOrder: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ order_id: z.string() }))
    .mutation(({ input }) => fraud_review_service.screen_order(input.order_id)),

  fraudReview: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      id: z.string(), decision: z.enum(["approved", "rejected", "review"]),
      decision_reason: z.string(),
    }))
    .mutation(({ input, ctx }) =>
      fraud_review_service.review({ ...input, user_id: ctx.session?.user?.id ?? "" }),
    ),

  fraudReviewStats: permission_procedure(PERMISSIONS.campaigns_read)
    .query(() => fraud_review_service.get_stats()),

  // ─── RMA ───────────────────────────────────────────────────────────────────

  rmaList: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ status: z.string().optional() }).optional())
    .query(({ input }) => rma_service.list(input?.status)),

  rmaGet: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ id: z.string() }))
    .query(({ input }) => rma_service.get(input.id)),

  rmaIssue: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      order_id: z.string(), return_request_id: z.string().optional(),
      carrier: z.string().optional(), tracking_number: z.string().optional(),
    }))
    .mutation(({ input, ctx }) =>
      rma_service.issue({ ...input, created_by_user_id: ctx.session?.user?.id ?? "" }),
    ),

  rmaGenerateLabel: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string(), label_url: z.string() }))
    .mutation(({ input }) => rma_service.generate_label(input.id, input.label_url)),

  rmaReceive: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      rma_service.mark_received(input.id, ctx.session?.user?.id ?? ""),
    ),

  rmaInspect: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({
      id: z.string(), inspection_notes: z.string(), disposition: z.string(),
    }))
    .mutation(({ input, ctx }) =>
      rma_service.inspect({ ...input, user_id: ctx.session?.user?.id ?? "" }),
    ),

  rmaComplete: permission_procedure(PERMISSIONS.campaigns_write)
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => rma_service.complete(input.id)),

  // ─── Agent KPI ─────────────────────────────────────────────────────────────

  agentKPI: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ user_id: z.string(), days: z.number().default(30) }))
    .query(({ input }) => agent_kpi_service.get_user_kpi(input.user_id, input.days)),

  agentLeaderboard: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ role: z.string(), days: z.number().default(7) }))
    .query(({ input }) => agent_kpi_service.get_role_leaderboard(input.role, input.days)),

  agentKPIDashboard: permission_procedure(PERMISSIONS.campaigns_read)
    .input(z.object({ days: z.number().default(7) }))
    .query(({ input }) => agent_kpi_service.get_dashboard_stats(input.days)),
});

// Helper for SLA definitions list
async function db_select_sla_definitions() {
  const { db } = await import("@/lib/db");
  const { sla_definitions } = await import("./schema");
  const { asc } = await import("drizzle-orm");
  return db.select().from(sla_definitions).orderBy(asc(sla_definitions.entity_type));
}
