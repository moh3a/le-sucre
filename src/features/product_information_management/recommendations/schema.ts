// schema.ts
import {
  decimal,
  index,
  int,
  json,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { generate_id } from "@/lib/utils";
import { products } from "@/features/product_information_management/products/schema";
import { users } from "@/features/authentication_and_authorization/auth/schema";

/** Precomputed recommendation edges (read-optimized, millions of rows) */
export const product_recommendation_edges = mysqlTable(
  "product_recommendation_edges",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    source_product_id: varchar("source_product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    target_product_id: varchar("target_product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    recommendation_type: varchar("recommendation_type", { length: 32 }).notNull(),
    // similar | related | fbt | personalized
    score: decimal("score", { precision: 8, scale: 4 }).notNull(),
    rank: int("rank").notNull(),
    signals: json("signals").$type<Record<string, number>>().default({}),
    computed_at: timestamp("computed_at", { mode: "string" }).notNull(),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_rec_edges_uidx").on(
      t.source_product_id,
      t.target_product_id,
      t.recommendation_type,
    ),
    index("product_rec_edges_source_type_rank_idx").on(
      t.source_product_id,
      t.recommendation_type,
      t.rank,
    ),
    index("product_rec_edges_target_idx").on(t.target_product_id),
    index("product_rec_edges_computed_idx").on(t.computed_at),
  ],
);

/** Co-purchase aggregates (collaborative filtering) */
export const product_co_purchase_stats = mysqlTable(
  "product_co_purchase_stats",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_a_id: varchar("product_a_id", { length: 24 }).notNull(),
    product_b_id: varchar("product_b_id", { length: 24 }).notNull(),
    pair_count: int("pair_count").notNull().default(0),
    score: decimal("score", { precision: 8, scale: 4 }).notNull().default("0"),
    window_days: int("window_days").notNull().default(90),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_co_purchase_pair_uidx").on(t.product_a_id, t.product_b_id, t.window_days),
    index("product_co_purchase_a_score_idx").on(t.product_a_id, t.score),
    index("product_co_purchase_b_score_idx").on(t.product_b_id, t.score),
  ],
);

/** Trending scores (precomputed daily/weekly) */
export const product_trending_scores = mysqlTable(
  "product_trending_scores",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    period: varchar("period", { length: 16 }).notNull(), // day | week
    period_key: varchar("period_key", { length: 16 }).notNull(), // 2026-05-28
    view_count: int("view_count").notNull().default(0),
    order_count: int("order_count").notNull().default(0),
    score: decimal("score", { precision: 10, scale: 4 }).notNull().default("0"),
    rank: int("rank").notNull().default(0),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("product_trending_uidx").on(t.product_id, t.period, t.period_key),
    index("product_trending_period_rank_idx").on(t.period, t.period_key, t.rank),
    index("product_trending_score_idx").on(t.period, t.period_key, t.score),
  ],
);

/** Persisted views (optional; Redis is hot path) */
export const customer_product_views = mysqlTable(
  "customer_product_views",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    user_id: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "cascade",
    }),
    session_key: varchar("session_key", { length: 64 }),
    product_id: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    viewed_at: timestamp("viewed_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("customer_product_views_user_viewed_idx").on(t.user_id, t.viewed_at),
    index("customer_product_views_session_viewed_idx").on(t.session_key, t.viewed_at),
    index("customer_product_views_product_idx").on(t.product_id, t.viewed_at),
  ],
);

/** Background indexing jobs */
export const recommendation_index_jobs = mysqlTable(
  "recommendation_index_jobs",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    job_type: varchar("job_type", { length: 64 }).notNull(),
    // reindex_product | reindex_batch | rebuild_trending | rebuild_copurchase
    payload: json("payload").$type<Record<string, unknown>>().default({}),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    attempts: int("attempts").notNull().default(0),
    run_after: timestamp("run_after", { mode: "string" }).defaultNow().notNull(),
    last_error: varchar("last_error", { length: 1000 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("recommendation_jobs_status_run_idx").on(t.status, t.run_after),
    index("recommendation_jobs_type_idx").on(t.job_type, t.created_at),
  ],
);

export const recommendationAnalyticsEvents = mysqlTable(
  "recommendation_analytics_events",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    event_type: varchar("event_type", { length: 32 }).notNull(), // impression | click
    slot_type: varchar("slot_type", { length: 32 }).notNull(),
    source_product_id: varchar("source_product_id", { length: 24 }),
    target_product_id: varchar("target_product_id", { length: 24 }).notNull(),
    user_id: varchar("user_id", { length: 255 }),
    session_key: varchar("session_key", { length: 64 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("rec_analytics_slot_created_idx").on(t.slot_type, t.created_at),
    index("rec_analytics_target_idx").on(t.target_product_id, t.created_at),
  ],
);
