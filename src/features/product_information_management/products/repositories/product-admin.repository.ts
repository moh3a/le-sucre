import "server-only";
import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, product_translations } from "../schema";
import { brands } from "@/features/product_information_management/brands/schema";
import { product_skus } from "@/features/product_information_management/variants/schema";
import { order_items, orders } from "@/features/order_management_system/orders/schema";
import { product_review_aggregates } from "@/features/product_reviews_management/schema";
import type { ProductStatus } from "../models/product.dto";
import { categories } from "../../schema";

const LOCALE = "fr";

export type AdminProductListFilters = {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatus;
  brand_id?: string;
  category_ids?: string[];
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  rating_max?: number;
};

export class ProductAdminRepository {
  async stats() {
    const [totals] = await db
      .select({
        total: count(),
        published:
          sql<number>`SUM(CASE WHEN ${products.status}='published' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
        draft: sql<number>`SUM(CASE WHEN ${products.status}='draft' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
        archived:
          sql<number>`SUM(CASE WHEN ${products.status}='archived' THEN 1 ELSE 0 END)`.mapWith(
            Number,
          ),
      })
      .from(products);

    const [sales] = await db
      .select({
        revenue: sql<string>`COALESCE(SUM(${order_items.line_total}), 0)`,
        units_sold: sql<number>`COALESCE(SUM(${order_items.quantity}), 0)`.mapWith(Number),
      })
      .from(order_items)
      .innerJoin(orders, eq(orders.id, order_items.order_id))
      .where(eq(orders.payment_status, "paid"));

    const [reviews] = await db
      .select({
        avg_rating: sql<string>`COALESCE(AVG(${product_review_aggregates.average_rating}), 0)`,
      })
      .from(product_review_aggregates)
      .where(sql`${product_review_aggregates.review_count} > 0`);

    const [low_stock] = await db
      .select({ count: count() })
      .from(product_skus)
      .where(and(eq(product_skus.is_active, true), lte(product_skus.stock_available, 5)));

    return {
      total_products: Number(totals?.total ?? 0),
      active_products: totals?.published ?? 0,
      inactive_products: (totals?.draft ?? 0) + (totals?.archived ?? 0),
      total_revenue: String(sales?.revenue ?? "0"),
      total_units_sold: sales?.units_sold ?? 0,
      average_rating: Number(reviews?.avg_rating ?? 0),
      low_stock_products: Number(low_stock?.count ?? 0),
    };
  }

  async list_enriched(filters: AdminProductListFilters) {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;
    const clauses = [];

    if (filters.status) clauses.push(eq(products.status, filters.status));
    if (filters.brand_id) clauses.push(eq(products.brand_id, filters.brand_id));
    if (filters.category_ids?.length)
      clauses.push(inArray(products.category_id, filters.category_ids));
    if (filters.price_min != null)
      clauses.push(gte(products.base_price, String(filters.price_min)));
    if (filters.price_max != null)
      clauses.push(lte(products.base_price, String(filters.price_max)));

    const stock_expr = sql<number>`COALESCE((
      SELECT SUM(ps.stock_available) FROM product_skus ps
      WHERE ps.product_id = ${products.id} AND ps.is_active = 1
    ), 0)`;

    if (filters.stock_status === "out_of_stock") clauses.push(sql`${stock_expr} = 0`);
    if (filters.stock_status === "low_stock")
      clauses.push(sql`${stock_expr} > 0 AND ${stock_expr} <= 5`);
    if (filters.stock_status === "in_stock") clauses.push(sql`${stock_expr} > 5`);

    if (filters.rating_min != null)
      clauses.push(gte(product_review_aggregates.average_rating, String(filters.rating_min)));
    if (filters.rating_max != null)
      clauses.push(lte(product_review_aggregates.average_rating, String(filters.rating_max)));

    if (filters.search) {
      const q = `%${filters.search}%`;
      clauses.push(
        sql`(${products.slug} LIKE ${q} OR ${products.sku} LIKE ${q} OR ${product_translations.name} LIKE ${q})`,
      );
    }

    const where = clauses.length ? and(...clauses) : undefined;

    const items = await db
      .select({
        id: products.id,
        slug: products.slug,
        sku: products.sku,
        status: products.status,
        base_price: products.base_price,
        created_at: products.created_at,
        name: product_translations.name,
        category_name: categories.name,
        brand_name: brands.name,
        image_url: sql<string | null>`(
          SELECT pm.url FROM product_media pm
          WHERE pm.product_id = ${products.id}
          ORDER BY pm.is_primary DESC, pm.sort_order ASC LIMIT 1
        )`,
        sku_count: sql<number>`(
          SELECT COUNT(*) FROM product_skus ps WHERE ps.product_id = ${products.id}
        )`.mapWith(Number),
        current_stock: stock_expr,
        units_sold: sql<number>`COALESCE((
          SELECT SUM(oi.quantity) FROM order_items oi
          INNER JOIN orders o ON o.id = oi.order_id
          WHERE oi.product_id = ${products.id} AND o.payment_status = 'paid'
        ), 0)`.mapWith(Number),
        revenue: sql<string>`COALESCE((
          SELECT SUM(oi.line_total) FROM order_items oi
          INNER JOIN orders o ON o.id = oi.order_id
          WHERE oi.product_id = ${products.id} AND o.payment_status = 'paid'
        ), '0')`,
        review_count: sql<number>`COALESCE(${product_review_aggregates.review_count}, 0)`.mapWith(
          Number,
        ),
        average_rating: sql<string>`COALESCE(${product_review_aggregates.average_rating}, '0')`,
      })
      .from(products)
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, LOCALE),
        ),
      )
      .leftJoin(categories, eq(categories.id, products.category_id))
      .leftJoin(brands, eq(brands.id, products.brand_id))
      .leftJoin(product_review_aggregates, eq(product_review_aggregates.product_id, products.id))
      .where(where)
      .orderBy(desc(products.created_at))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(products)
      .leftJoin(product_translations, eq(product_translations.product_id, products.id))
      .leftJoin(product_review_aggregates, eq(product_review_aggregates.product_id, products.id))
      .where(where);

    const total_records = Number(total ?? 0);
    const total_pages = Math.max(1, Math.ceil(total_records / limit));

    return {
      items,
      meta: { page, limit, total_records, total_pages, has_more: page < total_pages },
    };
  }

  bulk_update_status(ids: string[], status: ProductStatus) {
    return db.update(products).set({ status }).where(inArray(products.id, ids));
  }

  bulk_update_category(ids: string[], category_id: string) {
    return db.update(products).set({ category_id }).where(inArray(products.id, ids));
  }

  bulk_delete(ids: string[]) {
    return db.delete(products).where(inArray(products.id, ids));
  }
}

export const product_admin_repository = new ProductAdminRepository();
