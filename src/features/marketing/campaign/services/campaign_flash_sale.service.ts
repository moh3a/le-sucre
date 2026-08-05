import "server-only";
import { asc, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { flash_sale_repository } from "@/features/order_management_system/promotions/repositories/flash-sale.repository";
import { flash_sales, flash_sale_items, promotions } from "@/features/order_management_system/promotions/schema";

export interface FlashSaleState {
  campaign_id: string;
  name: string;
  slug: string;
  starts_at: string | null;
  ends_at: string | null;
  time_remaining_seconds: number;
  is_active: boolean;
  is_ending_soon: boolean;
  product_ids: string[];
  theme: Record<string, unknown>;
}

export interface FlashSaleTimer {
  campaign_id: string;
  starts_at: string | null;
  ends_at: string | null;
  time_remaining_seconds: number;
  total_duration_seconds: number;
  elapsed_percentage: number;
  is_active: boolean;
  is_ending_soon: boolean;
}

/**
 * DEPRECATED: campaign-based flash sales are superseded by the promotions
 * flash-sale feature (real SKU pricing, reservations, job runner) which is the
 * single source of truth. This storefront read surface delegates to the
 * promotions repository so the display stays in sync with transactional data.
 */
export class CampaignFlashSaleService {
  async get_active_flash_sales(): Promise<FlashSaleState[]> {
    const sales = await flash_sale_repository.list_active_with_items();
    if (!sales.length) return [];

    const slugs = await this._slug_map(sales.map((s) => s.promotion_id));
    const now = Date.now();

    return sales
      .filter(
        (s) =>
          new Date(s.starts_at).getTime() <= now && new Date(s.ends_at).getTime() >= now,
      )
      .map((sale) =>
        this._to_state(
          sale.id,
          sale.title,
          slugs.get(sale.promotion_id) ?? sale.id,
          sale.starts_at,
          sale.ends_at,
          sale.items.map((i) => i.product_id),
          20,
        ),
      )
      .sort((a, b) => (a.ends_at ?? "").localeCompare(b.ends_at ?? ""));
  }

  async get_flash_sale_by_slug(slug: string): Promise<FlashSaleState | null> {
    const [promotion] = await db
      .select()
      .from(promotions)
      .where(eq(promotions.slug, slug))
      .limit(1);

    if (!promotion) return null;

    const upcoming = await this._list_window("upcoming");
    const ended = await this._list_window("ended");
    const active = await this.get_active_flash_sales();

    const sale = [...active, ...upcoming, ...ended].find((s) => s.slug === slug);
    return sale ?? null;
  }

  async get_upcoming_flash_sales(): Promise<FlashSaleState[]> {
    return this._list_window("upcoming");
  }

  async get_ended_flash_sales(): Promise<FlashSaleState[]> {
    return this._list_window("ended");
  }

  private async _list_window(kind: "upcoming" | "ended"): Promise<FlashSaleState[]> {
    const where_clause =
      kind === "upcoming" ? gt(flash_sales.starts_at, sql`NOW()`) : lt(flash_sales.ends_at, sql`NOW()`);
    const order = kind === "upcoming" ? asc(flash_sales.starts_at) : desc(flash_sales.ends_at);

    const rows = await db
      .select()
      .from(flash_sales)
      .where(where_clause)
      .orderBy(order)
      .limit(10);

    if (!rows.length) return [];

    const slugs = await this._slug_map(rows.map((r) => r.promotion_id));

    const items = await db
      .select()
      .from(flash_sale_items)
      .where(inArray(flash_sale_items.flash_sale_id, rows.map((r) => r.id)));

    return rows.map((sale) =>
      this._to_state(
        sale.id,
        sale.title,
        slugs.get(sale.promotion_id) ?? sale.id,
        sale.starts_at,
        sale.ends_at,
        items.filter((i) => i.flash_sale_id === sale.id).map((i) => i.product_id),
        20,
      ),
    );
  }

  private async _slug_map(promotion_ids: string[]): Promise<Map<string, string>> {
    const unique_ids = [...new Set(promotion_ids)];
    const rows = await db
      .select({ id: promotions.id, slug: promotions.slug })
      .from(promotions)
      .where(inArray(promotions.id, unique_ids));
    return new Map(rows.map((r) => [r.id, r.slug]));
  }

  private _to_state(
    campaign_id: string,
    name: string,
    slug: string,
    starts_at: string,
    ends_at: string,
    product_ids: string[],
    limit: number,
  ): FlashSaleState {
    const timer = this.compute_timer(starts_at, ends_at);
    return {
      campaign_id,
      name,
      slug,
      starts_at,
      ends_at,
      time_remaining_seconds: timer.time_remaining_seconds,
      is_active: timer.is_active,
      is_ending_soon: timer.is_ending_soon,
      product_ids: product_ids.slice(0, limit),
      theme: {},
    };
  }

  compute_timer(starts_at: string | null, ends_at: string | null): FlashSaleTimer {
    const now = Date.now();
    const start = starts_at ? new Date(starts_at).getTime() : 0;
    const end = ends_at ? new Date(ends_at).getTime() : now + 3600000;

    const total_duration = end - start;
    const elapsed = Math.max(0, now - start);
    const remaining = Math.max(0, end - now);

    return {
      campaign_id: "",
      starts_at,
      ends_at,
      time_remaining_seconds: Math.floor(remaining / 1000),
      total_duration_seconds: Math.floor(total_duration / 1000),
      elapsed_percentage: total_duration > 0 ? Math.min(100, (elapsed / total_duration) * 100) : 0,
      is_active: remaining > 0 && now >= start,
      is_ending_soon: remaining > 0 && remaining < 3600000,
    };
  }
}

export const campaign_flash_sale_service = new CampaignFlashSaleService();
