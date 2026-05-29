import "server-only";
import type { z } from "zod";
import { NotFoundError } from "@/lib/error_handling";
import { promotion_repository } from "../repositories/promotion.repository";
import { promo_code_repository } from "../repositories/promo-code.repository";
import { flash_sale_repository } from "../repositories/flash-sale.repository";
import { bundle_repository } from "../repositories/bundle.repository";
import { promotion_scheduler_service } from "./promotion-scheduler.service";
import { invalidate_promotion_cache } from "../helpers/invalidate-promotion-cache.helper";
import type {
  create_promotion_dto,
  update_promotion_dto,
  create_promo_code_dto,
  create_flash_sale_dto,
  create_bundle_dto,
  list_promotions_dto,
} from "../models/promotion.dto";

export class PromotionService {
  list(input: z.infer<typeof list_promotions_dto>) {
    return promotion_repository.list_admin(
      input.page,
      input.limit,
      input.status,
      input.promotion_type,
    );
  }

  get(id: string) {
    return promotion_repository.get_with_rules(id);
  }

  async create(input: z.infer<typeof create_promotion_dto>) {
    const created = await promotion_repository.create({
      ...input,
      rules: input.rules.map((r) => ({
        scope_type: r.scope_type,
        scope_id: r.scope_id ?? null,
        discount_type: r.discount_type,
        discount_value: String(r.discount_value),
        min_subtotal: r.min_subtotal != null ? String(r.min_subtotal) : null,
        min_quantity: r.min_quantity ?? null,
        max_discount_amount: r.max_discount_amount != null ? String(r.max_discount_amount) : null,
        buy_quantity: r.buy_quantity ?? null,
        get_quantity: r.get_quantity ?? null,
        sort_order: r.sort_order,
        is_active: true,
      })),
    });
    await invalidate_promotion_cache();
    return created;
  }

  async update(input: z.infer<typeof update_promotion_dto>) {
    const existing = await promotion_repository.get_by_id(input.id);
    if (!existing) throw new NotFoundError("Promotion introuvable");

    const updated = await promotion_repository.update(input.id, {
      name: input.name,
      slug: input.slug,
      description: input.description,
      promotion_type: input.promotion_type,
      status: input.status,
      priority: input.priority,
      is_stackable: input.is_stackable,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      rules: input.rules?.map((r) => ({
        scope_type: r.scope_type,
        scope_id: r.scope_id ?? null,
        discount_type: r.discount_type,
        discount_value: String(r.discount_value),
        min_subtotal: r.min_subtotal != null ? String(r.min_subtotal) : null,
        min_quantity: r.min_quantity ?? null,
        max_discount_amount: r.max_discount_amount != null ? String(r.max_discount_amount) : null,
        buy_quantity: r.buy_quantity ?? null,
        get_quantity: r.get_quantity ?? null,
        sort_order: r.sort_order,
        is_active: true,
      })),
    });

    await invalidate_promotion_cache();
    return updated;
  }

  async create_promo_code(input: z.infer<typeof create_promo_code_dto>) {
    const promo = await promotion_repository.get_by_id(input.promotion_id);
    if (!promo) throw new NotFoundError("Promotion introuvable");

    const row = await promo_code_repository.create({
      promotion_id: input.promotion_id,
      code: input.code,
      usage_limit: input.usage_limit ?? null,
      per_customer_limit: input.per_customer_limit,
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      is_active: true,
    });

    await invalidate_promotion_cache();
    return row;
  }

  async create_flash_sale(input: z.infer<typeof create_flash_sale_dto>) {
    const promo = await promotion_repository.get_by_id(input.promotion_id);
    if (!promo) throw new NotFoundError("Promotion introuvable");

    const sale = await flash_sale_repository.create_with_items({
      promotion_id: input.promotion_id,
      title: input.title,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      max_total_units: input.max_total_units ?? null,
      items: input.items.map((i) => ({
        sku_id: i.sku_id,
        product_id: i.product_id,
        flash_price: String(i.flash_price),
        max_quantity: i.max_quantity,
      })),
    });

    await promotion_scheduler_service.schedule_flash_activation(sale!.id, input.starts_at);
    await promotion_scheduler_service.schedule_flash_deactivation(sale!.id, input.ends_at);
    await invalidate_promotion_cache();
    return sale;
  }

  async create_bundle(input: z.infer<typeof create_bundle_dto>) {
    const promo = await promotion_repository.get_by_id(input.promotion_id);
    if (!promo) throw new NotFoundError("Promotion introuvable");

    const bundle = await bundle_repository.create_with_items({
      promotion_id: input.promotion_id,
      name: input.name,
      bundle_type: input.bundle_type,
      bundle_price: input.bundle_price != null ? String(input.bundle_price) : null,
      discount_percent: input.discount_percent != null ? String(input.discount_percent) : null,
      buy_quantity: input.buy_quantity ?? null,
      get_quantity: input.get_quantity ?? null,
      items: input.items,
    });

    await invalidate_promotion_cache();
    return bundle;
  }
}

export const promotion_service = new PromotionService();
