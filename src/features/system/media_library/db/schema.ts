import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";

export const media = mysqlTable(
  "media",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    filename: varchar("filename", { length: 512 }).notNull(),
    original_name: varchar("original_name", { length: 512 }).notNull(),
    mime_type: varchar("mime_type", { length: 128 }).notNull(),
    kind: varchar("kind", { length: 32 }).notNull().default("image"),
    size: int("size").notNull().default(0),
    width: int("width"),
    height: int("height"),
    url: varchar("url", { length: 2048 }).notNull(),
    storage_key: varchar("storage_key", { length: 2048 }).notNull(),
    provider: varchar("provider", { length: 64 }).notNull().default("local"),
    alt: varchar("alt", { length: 512 }),
    caption: text("caption"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    is_public: boolean("is_public").notNull().default(true),
    uploaded_by: varchar("uploaded_by", { length: 255 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("media_kind_idx").on(t.kind),
    index("media_mime_type_idx").on(t.mime_type),
    index("media_uploaded_by_idx").on(t.uploaded_by),
    index("media_created_at_idx").on(t.created_at),
  ],
);

export const media_usage = mysqlTable(
  "media_usage",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    media_id: varchar("media_id", { length: 255 })
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    entity_type: varchar("entity_type", { length: 64 }).notNull(),
    entity_id: varchar("entity_id", { length: 255 }).notNull(),
    field: varchar("field", { length: 64 }),
    sort_order: int("sort_order").notNull().default(0),
    is_primary: boolean("is_primary").notNull().default(false),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("media_usage_entity_media_uidx").on(
      t.media_id,
      t.entity_type,
      t.entity_id,
      t.field,
    ),
    index("media_usage_entity_idx").on(t.entity_type, t.entity_id),
    index("media_usage_media_idx").on(t.media_id),
    index("media_usage_sort_idx").on(t.entity_type, t.entity_id, t.sort_order),
  ],
);

export const mediaRelations = relations(media, ({ many }) => ({
  usages: many(media_usage),
}));

export const mediaUsageRelations = relations(media_usage, ({ one }) => ({
  media: one(media, {
    fields: [media_usage.media_id],
    references: [media.id],
  }),
}));
