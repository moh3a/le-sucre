import type { UserProfile } from "@/features/authentication_and_authorization/profile/types";

export interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  grand_total: number;
  currency: string;
  placed_at: string | null;
}

export interface ActivityEntry {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: string | null;
  created_at: string;
}

export interface DashboardSummary {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  profile: UserProfile | null;
  recent_orders: RecentOrder[];
  wishlist: {
    total_wishlists: number;
    total_items: number;
  };
  saved_items_count: number;
  recent_activity: ActivityEntry[];
}
