import "server-only";
import { sanitize_csv_value } from "@/lib/security/export";
import type { z } from "zod";
import { category_service } from "@/features/product_information_management/categories/services/category.service";
import { invalidate_catalog_cache } from "@/features/product_information_management/catalog_discovery/helpers/invalidate-catalog-cache.helper";
import type { admin_list_products_dto, bulk_product_action_dto } from "../models/product-admin.dto";
import { product_admin_repository } from "../repositories/product-admin.repository";

export class ProductAdminService {
  stats() {
    return product_admin_repository.stats();
  }

  async list(input: z.infer<typeof admin_list_products_dto>) {
    const category_ids = input.category_id
      ? await category_service.resolve_filter_ids(input.category_id, true)
      : undefined;

    return product_admin_repository.list_enriched({
      page: input.page,
      limit: input.limit,
      search: input.search,
      status: input.status,
      brand_id: input.brand_id,
      category_ids,
      stock_status: input.stock_status,
      price_min: input.price_min,
      price_max: input.price_max,
      rating_min: input.rating_min,
      rating_max: input.rating_max,
    });
  }

  async bulk(input: z.infer<typeof bulk_product_action_dto>) {
    if (input.action === "activate")
      await product_admin_repository.bulk_update_status(input.product_ids, "published");
    if (input.action === "deactivate")
      await product_admin_repository.bulk_update_status(input.product_ids, "draft");
    if (input.action === "delete") await product_admin_repository.bulk_delete(input.product_ids);
    if (input.action === "assign_category" && input.category_id)
      await product_admin_repository.bulk_update_category(input.product_ids, input.category_id);

    void invalidate_catalog_cache();
    return { ok: true };
  }

  async export_csv(input: Omit<z.infer<typeof admin_list_products_dto>, "page" | "limit">) {
    const { items } = await this.list({ ...input, page: 1, limit: 10_000 });
    const header =
      "id,name,sku,status,category,brand,stock,units_sold,revenue,rating,reviews,created_at\n";
    const rows = items
      .map((p) =>
        [
          sanitize_csv_value(p.id),
          sanitize_csv_value(p.name ?? ""),
          sanitize_csv_value(p.sku ?? ""),
          sanitize_csv_value(p.status ?? ""),
          sanitize_csv_value(p.category_name ?? ""),
          sanitize_csv_value(p.brand_name ?? ""),
          String(p.current_stock ?? 0),
          String(p.units_sold ?? 0),
          String(p.revenue ?? 0),
          String(p.average_rating ?? 0),
          String(p.review_count ?? 0),
          sanitize_csv_value(p.created_at ?? ""),
        ].join(","),
      )
      .join("\n");
    return header + rows;
  }
}

export const product_admin_service = new ProductAdminService();
