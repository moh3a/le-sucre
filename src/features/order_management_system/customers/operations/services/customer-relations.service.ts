import "server-only";
import { generate_id } from "@/lib/utils";
import { throw_error } from "@/features/inventory_management_system/shared/error-codes";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";
import { customer_relations_repository as repo } from "../repositories/customer-relations.repository";

const CUSTOMER_ERROR = {
  FOLLOW_UP_NOT_FOUND: { code: "FOLLOW_UP_NOT_FOUND", status: 404, message: { fr: "Relance introuvable", en: "Follow-up not found", ar: "لم يتم العثور على المتابعة" } },
  CASE_NOT_FOUND: { code: "CASE_NOT_FOUND", status: 404, message: { fr: "Cas de support introuvable", en: "Support case not found", ar: "لم يتم العثور على حالة الدعم" } },
  INVALID_STATUS: { code: "INVALID_STATUS", status: 409, message: { fr: "Statut invalide pour cette opération", en: "Invalid status for this operation", ar: "حالة غير صالحة لهذه العملية" } },
};

export class CustomerRelationsService {
  async log_contact(input: { user_id?: string | null; order_id?: string | null; contact_type: string; direction: string; subject?: string; summary?: string; duration_seconds?: number; handled_by_user_id?: string }) {
    const id = await repo.insert_contact({
      id: generate_id(), user_id: input.user_id ?? null, order_id: input.order_id ?? null,
      contact_type: input.contact_type, direction: input.direction, subject: input.subject ?? null,
      summary: input.summary ?? null, duration_seconds: input.duration_seconds ?? null,
      handled_by_user_id: input.handled_by_user_id ?? null, metadata: {},
    });
    return id;
  }

  async get_contacts(user_id: string, page = 1, limit = 20) { return repo.get_contacts_by_user(user_id, page, limit); }

  async get_contacts_by_order(order_id: string) { return repo.get_contacts_by_order(order_id); }

  async add_note(input: { user_id: string; note_type: string; content: string; created_by_user_id: string }) {
    const id = await repo.insert_note({
      id: generate_id(), user_id: input.user_id, note_type: input.note_type,
      content: input.content, created_by_user_id: input.created_by_user_id,
    });
    return id;
  }

  async get_notes(user_id: string, note_type?: string) { return repo.get_notes_by_user(user_id, note_type); }

  async toggle_pin(note_id: string, is_pinned: boolean) { await repo.toggle_pin_note(note_id, is_pinned); }

  async create_follow_up(input: {
    user_id?: string | null; order_id?: string | null; follow_up_type: string; title: string;
    description?: string; assigned_to_user_id?: string; priority?: string; scheduled_at: string; created_by_user_id: string;
  }) {
    const id = await repo.insert_follow_up({
      id: generate_id(), user_id: input.user_id ?? null, order_id: input.order_id ?? null,
      follow_up_type: input.follow_up_type, title: input.title, description: input.description ?? null,
      assigned_to_user_id: input.assigned_to_user_id ?? null, priority: input.priority ?? "normal",
      status: "pending", scheduled_at: input.scheduled_at, created_by_user_id: input.created_by_user_id,
    });
    return repo.get_follow_up(id);
  }

  async complete_follow_up(input: { id: string; result_notes?: string; completed_by_user_id: string }) {
    const follow_up = await repo.get_follow_up(input.id);
    if (!follow_up) throw_error(CUSTOMER_ERROR.FOLLOW_UP_NOT_FOUND);
    await repo.update_follow_up(input.id, { status: "completed", completed_at: new Date().toISOString(), completed_by_user_id: input.completed_by_user_id, result_notes: input.result_notes ?? null });
  }

  async cancel_follow_up(input: { id: string; cancelled_by_user_id: string }) {
    await repo.update_follow_up(input.id, { status: "cancelled", completed_by_user_id: input.cancelled_by_user_id, completed_at: new Date().toISOString() });
  }

  async get_follow_up(id: string) { const fu = await repo.get_follow_up(id); if (!fu) throw_error(CUSTOMER_ERROR.FOLLOW_UP_NOT_FOUND); return fu; }

  async list_my_follow_ups(assigned_to_user_id: string, status?: string, page = 1, limit = 20) { return repo.list_follow_ups(assigned_to_user_id, status, page, limit); }

  async get_follow_ups_by_user(user_id: string) { return repo.get_follow_ups_by_user(user_id); }

  async get_overdue_follow_ups() { return repo.get_overdue_follow_ups(); }

  async create_case(input: { user_id?: string | null; order_id?: string | null; subject: string; description: string; category?: string; priority?: string; assigned_to_user_id?: string; created_by_user_id: string }) {
    const id = await repo.insert_case({
      id: generate_id(), user_id: input.user_id ?? null, order_id: input.order_id ?? null,
      subject: input.subject, description: input.description, category: input.category ?? "general",
      priority: input.priority ?? "normal", status: "open", assigned_to_user_id: input.assigned_to_user_id ?? null,
      created_by_user_id: input.created_by_user_id,
    });
    return repo.get_case(id);
  }

  async assign_case(input: { case_id: string; assigned_to_user_id: string; assigned_by_user_id: string }) {
    const c = await repo.get_case(input.case_id); if (!c) throw_error(CUSTOMER_ERROR.CASE_NOT_FOUND);
    await repo.update_case(input.case_id, { assigned_to_user_id: input.assigned_to_user_id, status: "assigned" });
  }

  async resolve_case(input: { case_id: string; resolution: string; resolved_by_user_id: string }) {
    const c = await repo.get_case(input.case_id); if (!c) throw_error(CUSTOMER_ERROR.CASE_NOT_FOUND);
    await repo.update_case(input.case_id, { status: "resolved", resolution: input.resolution, resolved_by_user_id: input.resolved_by_user_id, resolved_at: new Date().toISOString() });
  }

  async reopen_case(input: { case_id: string; reason: string; reopened_by_user_id: string }) {
    const c = await repo.get_case(input.case_id); if (!c) throw_error(CUSTOMER_ERROR.CASE_NOT_FOUND);
    if (c.status !== "resolved" && c.status !== "closed") throw_error(CUSTOMER_ERROR.INVALID_STATUS);
    await repo.update_case(input.case_id, { status: "reopened", reopened_count: (c.reopened_count ?? 0) + 1 });
  }

  async close_case(input: { case_id: string; closed_by_user_id: string }) { await repo.update_case(input.case_id, { status: "closed" }); }

  async get_case(id: string) { const c = await repo.get_case(id); if (!c) throw_error(CUSTOMER_ERROR.CASE_NOT_FOUND); return c; }

  async list_cases(page = 1, limit = 20, status?: string, assigned_to?: string) { return repo.list_cases(page, limit, status, assigned_to); }

  async get_cases_by_user(user_id: string) { return repo.get_cases_by_user(user_id); }

  async add_case_message(input: { case_id: string; message: string; is_internal?: boolean; author_user_id: string }) {
    const c = await repo.get_case(input.case_id); if (!c) throw_error(CUSTOMER_ERROR.CASE_NOT_FOUND);
    const id = await repo.insert_message({ id: generate_id(), case_id: input.case_id, author_user_id: input.author_user_id, message: input.message, is_internal: input.is_internal ?? false });
    if (!input.is_internal) await repo.update_case(input.case_id, { status: "in_progress" });
    return id;
  }

  async get_case_messages(case_id: string) { return repo.get_messages(case_id); }
}

export const customer_relations_service = new CustomerRelationsService();
