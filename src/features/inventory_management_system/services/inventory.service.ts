/**
 * TODO
 * await db.transaction(async (tx) => {
  const [level] = await tx
    .select()
    .from(inventory_levels)
    .where(eq(inventory_levels.sku_id, sku_id))
    .for("update"); // row lock

  const new_on_hand = level.quantity_on_hand + delta;
  if (new_on_hand < level.quantity_reserved) throw new ConflictError("Stock insuffisant");

  await tx.update(inventory_levels)
    .set({ quantity_on_hand: new_on_hand, version: level.version + 1 })
    .where(and(eq(inventory_levels.id, level.id), eq(inventory_levels.version, level.version)));

  await tx.insert(inventory_movements).values({ ... });
});

await sync_sku_stock_denormalized(sku_id); // updates product_skus.stock_available
await invalidate_product_stock_cache(product_id);
 */