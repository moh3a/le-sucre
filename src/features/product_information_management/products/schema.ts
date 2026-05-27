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
import { categories } from "@/features/product_information_management/categories/schema";

export const brands = mysqlTable(
  "brands",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    website_url: varchar("website_url", { length: 2048 }),
    logo_url: varchar("logo_url", { length: 2048 }),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("brands_slug_uidx").on(t.slug), index("brands_active_idx").on(t.is_active)],
);

export const products = mysqlTable(
  "products",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    sku: varchar("sku", { length: 64 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    category_id: varchar("category_id", { length: 255 })
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    brand_id: varchar("brand_id", { length: 255 }).references(() => brands.id, {
      onDelete: "set null",
    }),
    base_price: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
    offer_price: decimal("offer_price", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).notNull().default("DZD"),
    status: varchar("status", { length: 32 }).notNull().default("draft"), // draft, published, archived
    is_featured: boolean("is_featured").notNull().default(false),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    seo_title: varchar("seo_title", { length: 255 }),
    seo_description: varchar("seo_description", { length: 500 }),
    seo_keywords: varchar("seo_keywords", { length: 512 }),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("products_slug_uidx").on(t.slug),
    uniqueIndex("products_sku_uidx").on(t.sku),
    index("products_category_idx").on(t.category_id),
    index("products_brand_idx").on(t.brand_id),
    index("products_status_idx").on(t.status),
    index("products_price_idx").on(t.base_price),
  ],
);

export const product_translations = mysqlTable(
  "product_translations",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    locale: varchar("locale", { length: 5 }).notNull(), // en, fr, ar
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    keywords: varchar("keywords", { length: 512 }),
    seo_title: varchar("seo_title", { length: 255 }),
    seo_description: varchar("seo_description", { length: 500 }),
  },
  (t) => [
    uniqueIndex("product_translations_product_locale_uidx").on(t.product_id, t.locale),
    index("product_translations_locale_idx").on(t.locale),
  ],
);

export const product_media = mysqlTable(
  "product_media",
  {
    id: varchar("id", { length: 24 })
      .primaryKey()
      .$defaultFn(() => generate_id()),
    product_id: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 2048 }).notNull(), // full CDN URL or signed URL
    filename: varchar("filename", { length: 255 }),
    mime_type: varchar("mime_type", { length: 128 }),
    kind: varchar("kind", { length: 32 }).notNull().default("image"), // image, video, document
    alt: varchar("alt", { length: 255 }),
    sort_order: int("sort_order").notNull().default(0),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}), // width, height, provider, etc.
    is_primary: boolean("is_primary").notNull().default(false),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (t) => [
    index("product_media_product_idx").on(t.product_id),
    index("product_media_sort_idx").on(t.product_id, t.sort_order),
  ],
);

// Relations
export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brand_id],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  translations: many(product_translations),
  media: many(product_media),
}));

export const productTranslationsRelations = relations(product_translations, ({ one }) => ({
  product: one(products, {
    fields: [product_translations.product_id],
    references: [products.id],
  }),
}));

export const productMediaRelations = relations(product_media, ({ one }) => ({
  product: one(products, {
    fields: [product_media.product_id],
    references: [products.id],
  }),
}));
