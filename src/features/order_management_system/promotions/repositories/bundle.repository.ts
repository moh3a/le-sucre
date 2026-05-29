import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { generate_id } from "@/lib/utils";
import { promotion_bundles, promotion_bundle_items } from "../schema";

export type ActiveBundle = typeof promotion_bundles.$inferSelect & {
  items: (typeof promotion_bundle_items.$inferSelect)[];
};

export class BundleRepository {
  async list_active(): Promise<ActiveBundle[]> {
    const bundles = await db
      .select()
      .from(promotion_bundles)
      .where(eq(promotion_bundles.is_active, true));

    if (!bundles.length) return [];

    const bundle_ids = bundles.map((b) => b.id);
    const items = await db
      .select()
      .from(promotion_bundle_items)
      .where(inArray(promotion_bundle_items.bundle_id, bundle_ids));

    return bundles.map((bundle) => ({
      ...bundle,
      items: items.filter((i) => i.bundle_id === bundle.id),
    }));
  }

  async create_with_items(input: {
    promotion_id: string;
    name: string;
    bundle_type: string;
    bundle_price?: string | null;
    discount_percent?: string | null;
    buy_quantity?: number | null;
    get_quantity?: number | null;
    items: Array<{
      product_id?: string | null;
      sku_id?: string | null;
      quantity: number;
      is_required: boolean;
    }>;
  }) {
    const bundle_id = generate_id();
    await db.insert(promotion_bundles).values({
      id: bundle_id,
      promotion_id: input.promotion_id,
      name: input.name,
      bundle_type: input.bundle_type,
      bundle_price: input.bundle_price ?? null,
      discount_percent: input.discount_percent ?? null,
      buy_quantity: input.buy_quantity ?? null,
      get_quantity: input.get_quantity ?? null,
      is_active: true,
    });

    await db.insert(promotion_bundle_items).values(
      input.items.map((item) => ({
        id: generate_id(),
        bundle_id,
        product_id: item.product_id ?? null,
        sku_id: item.sku_id ?? null,
        quantity: item.quantity,
        is_required: item.is_required,
      })),
    );

    const [bundle] = await db
      .select()
      .from(promotion_bundles)
      .where(eq(promotion_bundles.id, bundle_id))
      .limit(1);

    return bundle;
  }
}

export const bundle_repository = new BundleRepository();
