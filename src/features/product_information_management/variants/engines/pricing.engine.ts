export async function resolve_unit_price(input: {
  sku_id: string;
  product_id: string;
  quantity: number;
  channel: "retail" | "wholesale";
  currency?: string;
}): Promise<{ unit_price: string; source: string }> {
  // TODO
  // 1. sku_prices WHERE sku_id, channel, min_quantity <= qty ORDER BY min_quantity DESC LIMIT 1
  // 2. wholesale_rules WHERE sku_id, min_quantity <= qty (fixed price or % off base)
  // 3. wholesale_rules WHERE product_id (same)
  // 4. product_skus.offer_price ?? product_skus.base_price
  // 5. products.offer_price ?? products.base_price
}
