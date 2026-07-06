import "server-only";

import { db } from "@/lib/db";
import { products } from "@/features/product_information_management/products/schema";
import { product_translations } from "@/features/product_information_management/products/schema";
import { product_media } from "@/features/product_information_management/products/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { review_service } from "@/features/product_reviews_management/services/review.service";
import { brand_service } from "@/features/product_information_management/brands/services/brand.service";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import type { CompareResponse, CompareProductData } from "../models/compare.dto";

const DEFAULT_LOCALE = "fr";

export class CompareService {
  async get_compare_data(
    slugs: string[],
    locale: string = DEFAULT_LOCALE,
  ): Promise<CompareResponse> {
    if (!slugs.length) {
      return { products: [], category: null };
    }

    const product_rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        category_id: products.category_id,
        brand_id: products.brand_id,
        base_price: products.base_price,
        offer_price: products.offer_price,
        currency: products.currency,
        status: products.status,
        has_variants: products.has_variants,
        metadata: products.metadata,
        name: product_translations.name,
        description: product_translations.description,
        image_url: product_media.url,
      })
      .from(products)
      .leftJoin(
        product_translations,
        and(
          eq(product_translations.product_id, products.id),
          eq(product_translations.locale, locale),
        ),
      )
      .leftJoin(
        product_media,
        and(eq(product_media.product_id, products.id), eq(product_media.is_primary, true)),
      )
      .where(inArray(products.slug, slugs));

    if (!product_rows.length) {
      return { products: [], category: null };
    }

    const category_id = product_rows[0]!.category_id;

    const category =
      category_id != null
        ? await category_service.find_by_id(category_id).catch(() => null)
        : null;

    const products_data: CompareProductData[] = await Promise.all(
      product_rows.map(async (row) => {
        const metadata =
          typeof row.metadata === "string"
            ? (JSON.parse(row.metadata) as Record<string, unknown>)
            : (row.metadata as Record<string, unknown> | null) ?? {};

        const technical_specs = (metadata.technical_specs as Record<string, string | number | boolean> | undefined) ?? {};

        const specs = Object.entries(technical_specs).map(([label, value]) => ({
          label,
          value: String(value),
        }));

        let brand_name: string | null = null;
        if (row.brand_id) {
          try {
            const b = await brand_service.get_by_id(row.brand_id);
            brand_name = b.name;
          } catch {
            // brand deleted
          }
        }

        let review_summary: { average_rating: number; review_count: number } | null = null;
        try {
          review_summary = await review_service.get_product_summary(row.id);
        } catch {
          // no reviews
        }

        return {
          id: row.id,
          slug: row.slug,
          name: row.name ?? row.slug,
          image_url: row.image_url,
          brand_name,
          base_price: Number(row.base_price),
          offer_price: row.offer_price != null ? Number(row.offer_price) : null,
          currency: row.currency,
          average_rating: review_summary?.average_rating ?? 0,
          review_count: review_summary?.review_count ?? 0,
          in_stock: row.status === "published",
          description: row.description,
          specs,
        };
      }),
    );

    return {
      products: products_data,
      category: category
        ? { id: category.id, name: category.name, slug: category.slug }
        : null,
    };
  }
}

export const compare_service = new CompareService();
