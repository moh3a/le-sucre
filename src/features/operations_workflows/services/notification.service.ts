import "server-only";
import { generate_id } from "@/lib/utils";
import { notification_repository } from "../repositories/notification.repository";
import { NOTIFICATION_MESSAGES } from "../constants/notifications";
import { audit_service } from "@/features/authentication_and_authorization/authorization/services/audit.service";

export class NotificationService {
  async notify(input: {
    user_id: string;
    type: string;
    title?: string;
    message?: string;
    reference_type?: string;
    reference_id?: string;
  }) {
    const template = NOTIFICATION_MESSAGES[input.type];
    await notification_repository.create({
      id: generate_id(),
      user_id: input.user_id,
      type: input.type,
      title: input.title ?? template?.title ?? input.type,
      message: input.message ?? template?.message ?? null,
      reference_type: input.reference_type ?? null,
      reference_id: input.reference_id ?? null,
      is_read: false,
      read_at: null,
    });
  }

  async notify_many(
    user_ids: string[],
    input: {
      type: string;
      title?: string;
      message?: string;
      reference_type?: string;
      reference_id?: string;
    },
  ) {
    const template = NOTIFICATION_MESSAGES[input.type];
    const values = user_ids.map((user_id) => ({
      id: generate_id(),
      user_id,
      type: input.type,
      title: input.title ?? template?.title ?? input.type,
      message: input.message ?? template?.message ?? null,
      reference_type: input.reference_type ?? null,
      reference_id: input.reference_id ?? null,
      is_read: false,
      read_at: null,
    }));
    for (const val of values) {
      await notification_repository.create(val);
    }
  }

  async mark_as_read(id: string, user_id: string) {
    await notification_repository.mark_as_read(id, user_id);
  }

  async mark_all_as_read(user_id: string) {
    await notification_repository.mark_all_as_read(user_id);
  }

  async list(user_id: string, page = 1, limit = 20, unread_only = false) {
    return notification_repository.list(user_id, page, limit, unread_only);
  }

  async count_unread(user_id: string) {
    return notification_repository.count_unread(user_id);
  }
}

export const notification_service = new NotificationService();
