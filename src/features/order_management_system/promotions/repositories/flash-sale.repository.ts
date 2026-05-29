import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { flash_sales, flash_sale_items } from "../schema";
import { promotion_cache_service } from "../services/promotion-cache.service";
import { PROMOTION_CACHE } from "../constants/cache-keys";

export class FlashSaleRepository {
  async set_status(flash_sale_id: string, status: string) {
    await db
      .update(flash_sales)
      .set({ status, updated_at: new Date().toISOString() })
      .where(eq(flash_sales.id, flash_sale_id));
  }

  async list_active_with_items() {
    const cached = await promotion_cache_service.get<
      Array<typeof flash_sales.$inferSelect & { items: (typeof flash_sale_items.$inferSelect)[] }>
    >(PROMOTION_CACHE.flash());
    if (cached) return cached;

    const sales = await db.select().from(flash_sales).where(eq(flash_sales.status, "active"));

    if (!sales.length) return [];

    const sale_ids = sales.map((s) => s.id);
    const items = await db
      .select()
      .from(flash_sale_items)
      .where(inArray(flash_sale_items.flash_sale_id, sale_ids));

    const grouped = sales.map((sale) => ({
      ...sale,
      items: items.filter((i) => i.flash_sale_id === sale.id),
    }));

    await promotion_cache_service.set(PROMOTION_CACHE.flash(), grouped, 180);
    return grouped;
  }

  async list_storefront() {
    const sales = await this.list_active_with_items();
    const now = Date.now();
    return sales.filter(
      (s) => new Date(s.starts_at).getTime() <= now && new Date(s.ends_at).getTime() >= now,
    );
  }

  async create_with_items(input: {
    promotion_id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    max_total_units?: number | null;
    items: Array<{
      sku_id: string;
      product_id: string;
      flash_price: string;
      max_quantity: number;
    }>;
  }) {
    const flash_sale_id = generate_id();
    await db.insert(flash_sales).values({
      id: flash_sale_id,
      promotion_id: input.promotion_id,
      title: input.title,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      max_total_units: input.max_total_units ?? null,
      status: "scheduled",
    });

    await db.insert(flash_sale_items).values(
      input.items.map((item) => ({
        id: generate_id(),
        flash_sale_id,
        sku_id: item.sku_id,
        product_id: item.product_id,
        flash_price: item.flash_price,
        max_quantity: item.max_quantity,
      })),
    );

    const [sale] = await db
      .select()
      .from(flash_sales)
      .where(eq(flash_sales.id, flash_sale_id))
      .limit(1);

    return sale;
  }
}

export const flash_sale_repository = new FlashSaleRepository();
