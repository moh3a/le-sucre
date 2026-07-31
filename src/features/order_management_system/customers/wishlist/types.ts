import type {
  wishlists,
  wishlist_items,
  collections,
  collection_items,
  favorites,
  save_for_later,
  wishlist_share_tokens,
  wishlist_analytics_events,
} from "./db/schema";

export type Wishlist = typeof wishlists.$inferSelect;
export type WishlistItem = typeof wishlist_items.$inferSelect;
export type Collection = typeof collections.$inferSelect;
export type CollectionItem = typeof collection_items.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type SaveForLater = typeof save_for_later.$inferSelect;
export type WishlistShareToken = typeof wishlist_share_tokens.$inferSelect;
export type WishlistAnalyticsEvent = typeof wishlist_analytics_events.$inferSelect;

export type WishlistWithItems = Wishlist & { items: WishlistWithProduct[] };
export type WishlistWithProduct = WishlistItem & {
  product?: {
    id: string;
    slug: string;
    base_price: string;
    offer_price: string | null;
    currency: string;
    status: string;
    translations?: Array<{ locale: string; name: string }>;
    media?: Array<{ url: string; is_primary: boolean }>;
  };
  variant?: {
    id: string;
    sku: string;
    price: string;
    stock: number;
    attributes: Record<string, string>;
  } | null;
};

export type CollectionWithItems = Collection & { items: CollectionItemWithProduct[] };
export type CollectionItemWithProduct = CollectionItem & {
  product?: {
    id: string;
    slug: string;
    base_price: string;
    offer_price: string | null;
    currency: string;
    translations?: Array<{ locale: string; name: string }>;
    media?: Array<{ url: string; is_primary: boolean }>;
  };
};

export type WishlistStats = {
  total_wishlists: number;
  total_items: number;
  total_purchased: number;
  conversion_rate: number;
};

export type WishlistAnalyticsSummary = {
  total_wishlists: number;
  active_wishlists: number;
  total_saved_products: number;
  wishlist_conversion_rate: number;
  revenue_from_wishlists: number;
  wishlist_growth: Array<{ date: string; count: number }>;
  conversion_trends: Array<{ date: string; conversions: number; adds: number }>;
  most_wished_products: Array<{ product_id: string; name: string; count: number }>;
  most_wished_brands: Array<{ brand_id: string; name: string; count: number }>;
  most_wished_categories: Array<{ category_id: string; name: string; count: number }>;
};

export type ShareDetails = {
  url: string;
  token: string;
  expires_at: string | null;
  permission: string;
};

export type WishlistPriority = "low" | "medium" | "high" | "urgent";
export type WishlistEventType =
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "add_to_collection"
  | "remove_from_collection"
  | "share_wishlist"
  | "purchase_from_wishlist"
  | "move_to_cart"
  | "move_to_save_later"
  | "move_from_save_later"
  | "favorite_product"
  | "unfavorite_product"
  | "wishlist_created"
  | "wishlist_deleted"
  | "price_drop_detected"
  | "back_in_stock";
