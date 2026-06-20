import "server-only";

import { ForbiddenError } from "@/lib/error_handling";

export class OwnershipService {
  assert_owner(
    resource_user_id: string,
    session_user_id: string,
    resource_name = "resource",
  ): void {
    if (resource_user_id !== session_user_id) {
      throw new ForbiddenError(`You do not own this ${resource_name}`);
    }
  }

  assert_access(
    resource_user_id: string,
    session_user_id: string,
    session_roles: string[],
    admin_roles: string[],
    resource_name = "resource",
  ): void {
    if (resource_user_id === session_user_id) return;
    const is_admin = session_roles.some((r) => admin_roles.includes(r));
    if (!is_admin) {
      throw new ForbiddenError(`Access denied to ${resource_name}`);
    }
  }

  assert_operator_access(
    order_operator_id: string | null | undefined,
    session_user_id: string,
    session_roles: string[],
  ): void {
    if (session_roles.includes("admin")) return;
    if (session_roles.includes("moderator")) return;
    if (order_operator_id && order_operator_id !== session_user_id) {
      throw new ForbiddenError("You can only access orders assigned to you");
    }
  }

  assert_delivery_access(
    order_delivery_person_id: string | null | undefined,
    session_user_id: string,
    session_roles: string[],
  ): void {
    if (session_roles.includes("admin")) return;
    if (session_roles.includes("moderator")) return;
    if (order_delivery_person_id && order_delivery_person_id !== session_user_id) {
      throw new ForbiddenError("You can only access deliveries assigned to you");
    }
  }

  assert_review_moderation(
    review_author_id: string,
    session_user_id: string,
    session_roles: string[],
  ): void {
    if (review_author_id === session_user_id) return;
    if (session_roles.includes("admin") || session_roles.includes("moderator")) return;
    throw new ForbiddenError("You can only moderate your own reviews");
  }
}

export const ownership_service = new OwnershipService();
