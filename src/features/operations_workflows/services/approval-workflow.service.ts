import "server-only";
import { db } from "@/lib/db";
import { eq, and, asc } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { approval_workflows, approval_requests, approval_actions } from "../schema";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class ApprovalWorkflowService {
  async create_workflow(input: {
    name: string;
    entity_type: string;
    steps: Array<{ order: number; role: string; label: string }>;
  }) {
    const id = generate_id();
    await db.insert(approval_workflows).values({ id, ...input });
    return this.get_workflow(id);
  }

  async get_workflow(id: string) {
    const [row] = await db.select().from(approval_workflows).where(eq(approval_workflows.id, id)).limit(1);
    return row ?? null;
  }

  async get_workflow_by_entity(entity_type: string) {
    const [row] = await db
      .select()
      .from(approval_workflows)
      .where(and(eq(approval_workflows.entity_type, entity_type), eq(approval_workflows.is_active, true)))
      .limit(1);
    return row ?? null;
  }

  async list_workflows() {
    return db.select().from(approval_workflows).orderBy(asc(approval_workflows.name));
  }

  async submit_for_approval(input: {
    entity_type: string;
    entity_id: string;
    requested_by_user_id: string;
    notes?: string;
    metadata?: Record<string, unknown>;
  }) {
    const workflow = await this.get_workflow_by_entity(input.entity_type);
    if (!workflow) throw new Error(`No approval workflow configured for ${input.entity_type}`);

    const id = generate_id();
    await db.insert(approval_requests).values({
      id,
      workflow_id: workflow.id,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      requested_by_user_id: input.requested_by_user_id,
      current_step: 0,
      status: "pending",
      notes: input.notes ?? null,
      metadata: input.metadata ?? {},
    });

    void audit_service.log({
      action: `approval.submitted.${input.entity_type}`,
      resource_type: input.entity_type,
      resource_id: input.entity_id,
      metadata: { request_id: id, workflow_id: workflow.id },
    });

    return this.get_request(id);
  }

  async approve_step(input: {
    request_id: string;
    user_id: string;
    comment?: string;
  }) {
    const request = await this.get_request(input.request_id);
    if (!request) throw new Error("Approval request not found");
    if (request.status !== "pending") throw new Error("Request is not pending");
    if (request.current_step > 0) {
      const has_step_action = await db
        .select()
        .from(approval_actions)
        .where(
          and(
            eq(approval_actions.request_id, input.request_id),
            eq(approval_actions.step, request.current_step),
          ),
        )
        .limit(1);
      if (has_step_action.length) throw new Error("Step already approved");
    }

    const workflow = await this.get_workflow(request.workflow_id);
    if (!workflow) throw new Error("Workflow not found");

    const steps = workflow.steps as Array<{ order: number; role: string; label: string }>;
    const current_step_def = steps[request.current_step];
    if (!current_step_def) throw new Error("No approval step definition found");

    await db.insert(approval_actions).values({
      id: generate_id(),
      request_id: input.request_id,
      step: request.current_step,
      user_id: input.user_id,
      action: "approved",
      comment: input.comment ?? null,
    });

    const is_last_step = request.current_step >= steps.length - 1;

    if (is_last_step) {
      await db
        .update(approval_requests)
        .set({ status: "approved", current_step: request.current_step + 1 })
        .where(eq(approval_requests.id, input.request_id));

      void audit_service.log({
        action: `approval.approved.${request.entity_type}`,
        resource_type: request.entity_type,
        resource_id: request.entity_id,
        metadata: { request_id: input.request_id },
      });
    } else {
      await db
        .update(approval_requests)
        .set({ current_step: request.current_step + 1 })
        .where(eq(approval_requests.id, input.request_id));
    }

    return this.get_request(input.request_id);
  }

  async reject(input: {
    request_id: string;
    user_id: string;
    comment?: string;
  }) {
    const request = await this.get_request(input.request_id);
    if (!request) throw new Error("Approval request not found");
    if (request.status !== "pending") throw new Error("Request is not pending");

    await db.insert(approval_actions).values({
      id: generate_id(),
      request_id: input.request_id,
      step: request.current_step,
      user_id: input.user_id,
      action: "rejected",
      comment: input.comment ?? null,
    });

    await db
      .update(approval_requests)
      .set({ status: "rejected" })
      .where(eq(approval_requests.id, input.request_id));

    void audit_service.log({
      action: `approval.rejected.${request.entity_type}`,
      resource_type: request.entity_type,
      resource_id: request.entity_id,
      metadata: { request_id: input.request_id },
    });

    return this.get_request(input.request_id);
  }

  async get_request(id: string) {
    const [row] = await db.select().from(approval_requests).where(eq(approval_requests.id, id)).limit(1);
    if (!row) return null;
    const actions = await db
      .select()
      .from(approval_actions)
      .where(eq(approval_actions.request_id, id))
      .orderBy(asc(approval_actions.step));
    return { ...row, actions };
  }

  async get_pending_requests(entity_type?: string) {
    const clauses = [eq(approval_requests.status, "pending")];
    if (entity_type) clauses.push(eq(approval_requests.entity_type, entity_type));
    return db
      .select()
      .from(approval_requests)
      .where(and(...clauses))
      .orderBy(asc(approval_requests.created_at));
  }

  async get_requests_for_entity(entity_type: string, entity_id: string) {
    return db
      .select()
      .from(approval_requests)
      .where(and(eq(approval_requests.entity_type, entity_type), eq(approval_requests.entity_id, entity_id)))
      .orderBy(asc(approval_requests.created_at));
  }
}

export const approval_workflow_service = new ApprovalWorkflowService();
