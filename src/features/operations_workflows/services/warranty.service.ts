import "server-only";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { warranty_repository as repo } from "../repositories/warranty.repository";
import { OPERATIONS_ERROR } from "../constants/error-codes";

export class WarrantyService {
  async create(input: {
    order_id: string;
    order_item_id?: string;
    product_id: string;
    sku_id: string;
    user_id?: string;
    issue_type: string;
    description: string;
    technician_user_id?: string;
  }) {
    const id = await repo.create({
      id: generate_id(),
      order_id: input.order_id,
      order_item_id: input.order_item_id ?? null,
      product_id: input.product_id,
      sku_id: input.sku_id,
      user_id: input.user_id ?? null,
      status: "pending",
      issue_type: input.issue_type,
      description: input.description,
      technician_user_id: input.technician_user_id ?? null,
    });

    void audit_service.log({
      actor_user_id: input.user_id,
      action: "warranty.create",
      resource_type: "warranty_id",
      resource_id: id,
    });

    return repo.find_by_id(id);
  }

  async review(input: {
    id: string;
    status: "approved" | "rejected" | "under_review";
    technician_user_id?: string;
    technician_notes?: string;
    reviewed_by_user_id: string;
  }) {
    const request = await repo.find_by_id(input.id);
    if (!request) throw_error(OPERATIONS_ERROR.WARRANTY_NOT_FOUND);

    await repo.update(input.id, {
      status: input.status,
      technician_user_id: input.technician_user_id ?? null,
      technician_notes: input.technician_notes ?? null,
      reviewed_by_user_id: input.reviewed_by_user_id,
      reviewed_at: new Date().toISOString(),
    });

    void audit_service.log({
      actor_user_id: input.reviewed_by_user_id,
      action: "warranty.review",
      resource_type: "warranty_id",
      resource_id: input.id,
      metadata: { status: input.status },
    });

    return repo.find_by_id(input.id);
  }

  async resolve(input: {
    id: string;
    resolution_type: string;
    resolution_notes?: string;
    resolved_by_user_id: string;
  }) {
    const request = await repo.find_by_id(input.id);
    if (!request) throw_error(OPERATIONS_ERROR.WARRANTY_NOT_FOUND);

    await repo.update(input.id, {
      status: "completed",
      resolution_type: input.resolution_type,
      resolution_notes: input.resolution_notes ?? null,
      completed_at: new Date().toISOString(),
    });

    void audit_service.log({
      actor_user_id: input.resolved_by_user_id,
      action: "warranty.resolve",
      resource_type: "warranty_id",
      resource_id: input.id,
      metadata: { resolution_type: input.resolution_type },
    });
  }

  async get(id: string) {
    const request = await repo.find_by_id(id);
    if (!request) throw_error(OPERATIONS_ERROR.WARRANTY_NOT_FOUND);
    return request;
  }

  async list_by_order(order_id: string) {
    return repo.find_by_order(order_id);
  }

  async list(page = 1, limit = 20, status?: string) {
    return repo.list(page, limit, status);
  }

  async stats() {
    return repo.stats();
  }
}

export const warranty_service = new WarrantyService();
