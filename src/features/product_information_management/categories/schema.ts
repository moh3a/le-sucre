import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { generate_id } from "@/lib/utils";

export const categories = mysqlTable(
  "categories",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    parent_id: varchar("parent_id", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    path: varchar("path", { length: 2048 }).notNull(),
    depth: int("depth").notNull().default(0),
    sort_order: int("sort_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("categories_slug_uidx").on(t.slug),
    index("categories_parent_id_idx").on(t.parent_id),
    index("categories_path_idx").on(t.path),
    index("categories_depth_idx").on(t.depth),
    index("categories_active_sort_idx").on(t.is_active, t.sort_order),
  ],
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parent_id],
    references: [categories.id],
    relationName: "category_parent",
  }),
  children: many(categories, { relationName: "category_parent" }),
}));
