import "server-only";

import { profile_repository } from "@/features/authentication_and_authorization/profile/repositories/profile.repository";
import { order_repository } from "@/features/order_management_system/orders/repositories/order.repository";
import { wishlist_service } from "@/features/wishlist_management_system/services/wishlist.service";
import { save_for_later_repository } from "@/features/wishlist_management_system/repositories/save_for_later.repository";
import { audit_repository } from "@/features/authentication_and_authorization/authorization/repositories/audit.repository";

import type { DashboardSummary, RecentOrder, ActivityEntry } from "../types";

export class DashboardService {
  async get_summary(user: { id: string; name: string; email: string; image?: string | null }): Promise<DashboardSummary> {
    const [profile, order_result, wishlist_stats, saved_items_count, activity_result] =
      await Promise.all([
        profile_repository.find_by_user_id(user.id),
        order_repository.list_for_customer(user.id, 1, 3),
        wishlist_service.get_stats(user.id),
        save_for_later_repository.count_by_customer(user.id),
        audit_repository.list_by_user(user.id, 1, 5),
      ]);

    const recent_orders: RecentOrder[] = order_result.items.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      grand_total: Number(o.grand_total),
      currency: o.currency,
      placed_at: o.placed_at,
    }));

    const recent_activity: ActivityEntry[] = activity_result.items.map((a) => ({
      id: a.id,
      action: a.action,
      resource_type: a.resource_type,
      resource_id: a.resource_id,
      metadata: a.metadata,
      created_at: a.created_at,
    }));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      },
      profile,
      recent_orders,
      wishlist: {
        total_wishlists: wishlist_stats.total_wishlists,
        total_items: wishlist_stats.total_items,
      },
      saved_items_count,
      recent_activity,
    };
  }
}

export const dashboard_service = new DashboardService();
