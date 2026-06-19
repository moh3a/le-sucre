import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  int,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { products } from "@/features/product_information_management/products/schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { brands } from "@/features/product_information_management/brands/schema";
import { categories } from "@/features/product_information_management/categories/schema";

// ─── Wishlists ─────────────────────────────────────────────

export const wishlists = mysqlTable(
  "wishlists",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    customer_id: varchar("customer_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    is_default: boolean("is_default").notNull().default(false),
    is_public: boolean("is_public").notNull().default(false),
    is_private: boolean("is_private").notNull().default(true),
    sort_order: int("sort_order").notNull().default(0),
    cover_image_url: varchar("cover_image_url", { length: 2048 }),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    item_count: int("item_count").notNull().default(0),
    shared_count: int("shared_count").notNull().default(0),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("wishlists_customer_slug_uidx").on(t.customer_id, t.slug),
    index("wishlists_customer_idx").on(t.customer_id),
    index("wishlists_public_idx").on(t.is_public),
    index("wishlists_default_idx").on(t.customer_id, t.is_default),
  ],
);

// ─── Wishlist Items ────────────────────────────────────────

export const wishlist_items = mysqlTable(
  "wishlist_items",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    wishlist_id: varchar("wishlist_id", { length: 255 })
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variant_id: varchar("variant_id", { length: 255 }).references(() => product_skus.id, {
      onDelete: "set null",
    }),
    quantity: int("quantity").notNull().default(1),
    priority: varchar("priority", { length: 32 }).notNull().default("medium"), // low, medium, high, urgent
    notes: text("notes"),
    saved_price: decimal("saved_price", { precision: 12, scale: 2 }),
    saved_currency: varchar("saved_currency", { length: 3 }).notNull().default("DZD"),
    current_price: decimal("current_price", { precision: 12, scale: 2 }),
    price_history: json("price_history").$type<Array<{ price: string; date: string }>>().default([]),
    is_purchased: boolean("is_purchased").notNull().default(false),
    purchased_at: timestamp("purchased_at", { mode: "string" }),
    purchased_in_order_id: varchar("purchased_in_order_id", { length: 255 }),
    sort_order: int("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("wishlist_items_wishlist_product_uidx").on(t.wishlist_id, t.product_id, t.variant_id),
    index("wishlist_items_wishlist_idx").on(t.wishlist_id),
    index("wishlist_items_product_idx").on(t.product_id),
    index("wishlist_items_priority_idx").on(t.priority),
    index("wishlist_items_purchased_idx").on(t.is_purchased),
  ],
);

// ─── Collections ───────────────────────────────────────────

export const collections = mysqlTable(
  "collections",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    customer_id: varchar("customer_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    cover_image_url: varchar("cover_image_url", { length: 2048 }),
    is_public: boolean("is_public").notNull().default(false),
    is_featured: boolean("is_featured").notNull().default(false),
    sort_order: int("sort_order").notNull().default(0),
    item_count: int("item_count").notNull().default(0),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("collections_customer_slug_uidx").on(t.customer_id, t.slug),
    index("collections_customer_idx").on(t.customer_id),
    index("collections_public_idx").on(t.is_public),
    index("collections_featured_idx").on(t.is_featured),
  ],
);

export const collection_items = mysqlTable(
  "collection_items",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    collection_id: varchar("collection_id", { length: 255 })
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variant_id: varchar("variant_id", { length: 255 }).references(() => product_skus.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    sort_order: int("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("collection_items_collection_product_uidx").on(t.collection_id, t.product_id, t.variant_id),
    index("collection_items_collection_idx").on(t.collection_id),
    index("collection_items_product_idx").on(t.product_id),
  ],
);

// ─── Favorites ─────────────────────────────────────────────

export const favorites = mysqlTable(
  "favorites",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    customer_id: varchar("customer_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 255 }).references(() => products.id, {
      onDelete: "cascade",
    }),
    brand_id: varchar("brand_id", { length: 255 }).references(() => brands.id, {
      onDelete: "cascade",
    }),
    category_id: varchar("category_id", { length: 255 }).references(() => categories.id, {
      onDelete: "cascade",
    }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("favorites_customer_product_uidx").on(t.customer_id, t.product_id),
    uniqueIndex("favorites_customer_brand_uidx").on(t.customer_id, t.brand_id),
    uniqueIndex("favorites_customer_category_uidx").on(t.customer_id, t.category_id),
    index("favorites_customer_idx").on(t.customer_id),
    index("favorites_product_idx").on(t.product_id),
    index("favorites_brand_idx").on(t.brand_id),
    index("favorites_category_idx").on(t.category_id),
  ],
);

// ─── Save For Later ────────────────────────────────────────

export const save_for_later = mysqlTable(
  "save_for_later",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    customer_id: varchar("customer_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    product_id: varchar("product_id", { length: 255 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variant_id: varchar("variant_id", { length: 255 }).references(() => product_skus.id, {
      onDelete: "set null",
    }),
    quantity: int("quantity").notNull().default(1),
    original_cart_item_id: varchar("original_cart_item_id", { length: 255 }),
    saved_date: timestamp("saved_date", { mode: "string" }).defaultNow().notNull(),
    notes: text("notes"),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("save_for_later_customer_product_uidx").on(t.customer_id, t.product_id, t.variant_id),
    index("save_for_later_customer_idx").on(t.customer_id),
    index("save_for_later_product_idx").on(t.product_id),
  ],
);

// ─── Share Tokens ──────────────────────────────────────────

export const wishlist_share_tokens = mysqlTable(
  "wishlist_share_tokens",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    wishlist_id: varchar("wishlist_id", { length: 255 })
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    is_active: boolean("is_active").notNull().default(true),
    permission: varchar("permission", { length: 32 }).notNull().default("read"), // read, collaborate
    expires_at: timestamp("expires_at", { mode: "string" }),
    max_uses: int("max_uses").notNull().default(0),
    use_count: int("use_count").notNull().default(0),
    created_by: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("wishlist_share_tokens_token_uidx").on(t.token),
    index("wishlist_share_tokens_wishlist_idx").on(t.wishlist_id),
    index("wishlist_share_tokens_active_idx").on(t.is_active),
  ],
);

// ─── Wishlist Analytics Events ─────────────────────────────

export const wishlist_analytics_events = mysqlTable(
  "wishlist_analytics_events",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    customer_id: varchar("customer_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    wishlist_id: varchar("wishlist_id", { length: 255 }).references(() => wishlists.id, {
      onDelete: "set null",
    }),
    product_id: varchar("product_id", { length: 255 }).references(() => products.id, {
      onDelete: "set null",
    }),
    event_type: varchar("event_type", { length: 64 }).notNull(), // add_to_wishlist, remove_from_wishlist, add_to_collection, share_wishlist, purchase_from_wishlist, move_to_cart, move_to_save_later
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("wishlist_analytics_events_customer_idx").on(t.customer_id),
    index("wishlist_analytics_events_wishlist_idx").on(t.wishlist_id),
    index("wishlist_analytics_events_product_idx").on(t.product_id),
    index("wishlist_analytics_events_type_idx").on(t.event_type),
    index("wishlist_analytics_events_created_idx").on(t.created_at),
  ],
);

// ─── Relations ─────────────────────────────────────────────

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  customer: one(users, {
    fields: [wishlists.customer_id],
    references: [users.id],
  }),
  items: many(wishlist_items),
  share_tokens: many(wishlist_share_tokens),
}));

export const wishlistItemsRelations = relations(wishlist_items, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlist_items.wishlist_id],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlist_items.product_id],
    references: [products.id],
  }),
  variant: one(product_skus, {
    fields: [wishlist_items.variant_id],
    references: [product_skus.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  customer: one(users, {
    fields: [collections.customer_id],
    references: [users.id],
  }),
  items: many(collection_items),
}));

export const collectionItemsRelations = relations(collection_items, ({ one }) => ({
  collection: one(collections, {
    fields: [collection_items.collection_id],
    references: [collections.id],
  }),
  product: one(products, {
    fields: [collection_items.product_id],
    references: [products.id],
  }),
  variant: one(product_skus, {
    fields: [collection_items.variant_id],
    references: [product_skus.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  customer: one(users, {
    fields: [favorites.customer_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [favorites.product_id],
    references: [products.id],
  }),
  brand: one(brands, {
    fields: [favorites.brand_id],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [favorites.category_id],
    references: [categories.id],
  }),
}));

export const saveForLaterRelations = relations(save_for_later, ({ one }) => ({
  customer: one(users, {
    fields: [save_for_later.customer_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [save_for_later.product_id],
    references: [products.id],
  }),
  variant: one(product_skus, {
    fields: [save_for_later.variant_id],
    references: [product_skus.id],
  }),
}));

export const wishlistShareTokensRelations = relations(wishlist_share_tokens, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlist_share_tokens.wishlist_id],
    references: [wishlists.id],
  }),
  creator: one(users, {
    fields: [wishlist_share_tokens.created_by],
    references: [users.id],
  }),
}));

export const wishlistAnalyticsEventsRelations = relations(wishlist_analytics_events, ({ one }) => ({
  customer: one(users, {
    fields: [wishlist_analytics_events.customer_id],
    references: [users.id],
  }),
  wishlist: one(wishlists, {
    fields: [wishlist_analytics_events.wishlist_id],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlist_analytics_events.product_id],
    references: [products.id],
  }),
}));
