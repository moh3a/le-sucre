import {
  boolean,
  decimal,
  index,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { products } from "@/features/product_information_management/products/schema";
import { orders, order_items } from "@/features/order_management_system/orders/schema";

export const product_reviews = mysqlTable(
  "product_reviews",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    order_id: varchar("order_id", { length: 24 }).references(() => orders.id, {
      onDelete: "set null",
    }),
    order_item_id: varchar("order_item_id", { length: 24 }).references(() => order_items.id, {
      onDelete: "set null",
    }),

    rating: int("rating").notNull(), // 1..5
    title: varchar("title", { length: 255 }),
    body: text("body").notNull(),

    status: varchar("status", { length: 32 }).notNull().default("pending"), // pending|approved|rejected|hidden
    moderation_note: varchar("moderation_note", { length: 512 }),

    is_verified_purchase: boolean("is_verified_purchase").notNull().default(false),
    locale: varchar("locale", { length: 5 }).notNull().default("fr"),

    helpful_count: int("helpful_count").notNull().default(0),
    report_count: int("report_count").notNull().default(0),

    content_hash: varchar("content_hash", { length: 64 }).notNull(),
    ip_hash: varchar("ip_hash", { length: 64 }),

    approved_at: timestamp("approved_at", { mode: "string" }),
    rejected_at: timestamp("rejected_at", { mode: "string" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_reviews_user_product_uidx").on(t.user_id, t.product_id),
    index("product_reviews_product_status_created_idx").on(t.product_id, t.status, t.created_at),
    index("product_reviews_product_status_rating_idx").on(t.product_id, t.status, t.rating),
    index("product_reviews_user_created_idx").on(t.user_id, t.created_at),
    index("product_reviews_status_created_idx").on(t.status, t.created_at),
    index("product_reviews_helpful_idx").on(t.product_id, t.status, t.helpful_count),
  ],
);

export const product_review_aggregates = mysqlTable("product_review_aggregates", {
  product_id: varchar("product_id", { length: 24 })
    .primaryKey()
    .references(() => products.id, { onDelete: "cascade" }),
  average_rating: decimal("average_rating", { precision: 4, scale: 2 }).notNull().default("0"),
  review_count: int("review_count").notNull().default(0),
  rating_1: int("rating_1").notNull().default(0),
  rating_2: int("rating_2").notNull().default(0),
  rating_3: int("rating_3").notNull().default(0),
  rating_4: int("rating_4").notNull().default(0),
  rating_5: int("rating_5").notNull().default(0),
  updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export const product_review_helpful_votes = mysqlTable(
  "product_review_helpful_votes",
  {
    review_id: varchar("review_id", { length: 24 })
      .notNull()
      .references(() => product_reviews.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_review_helpful_uidx").on(t.review_id, t.user_id),
    index("product_review_helpful_review_idx").on(t.review_id),
  ],
);

export const product_review_reports = mysqlTable(
  "product_review_reports",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    review_id: varchar("review_id", { length: 24 })
      .notNull()
      .references(() => product_reviews.id, { onDelete: "cascade" }),
    reporter_user_id: varchar("reporter_user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 64 }).notNull(),
    details: varchar("details", { length: 1000 }),
    status: varchar("status", { length: 32 }).notNull().default("open"), // open|resolved|dismissed
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_review_reports_unique_uidx").on(t.review_id, t.reporter_user_id),
    index("product_review_reports_review_idx").on(t.review_id, t.status),
  ],
);

export const product_review_moderation_events = mysqlTable(
  "product_review_moderation_events",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    review_id: varchar("review_id", { length: 24 })
      .notNull()
      .references(() => product_reviews.id, { onDelete: "cascade" }),
    actor_user_id: varchar("actor_user_id", { length: 255 }),
    from_status: varchar("from_status", { length: 32 }),
    to_status: varchar("to_status", { length: 32 }).notNull(),
    note: varchar("note", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [index("product_review_moderation_review_idx").on(t.review_id, t.created_at)],
);

export const productReviewsRelations = relations(product_reviews, ({ one, many }) => ({
  product: one(products, { fields: [product_reviews.product_id], references: [products.id] }),
  user: one(users, { fields: [product_reviews.user_id], references: [users.id] }),
  helpful_votes: many(product_review_helpful_votes),
  reports: many(product_review_reports),
}));

export const productReviewAggregatesRelations = relations(product_review_aggregates, ({ one }) => ({
  product: one(products, {
    fields: [product_review_aggregates.product_id],
    references: [products.id],
  }),
}));
