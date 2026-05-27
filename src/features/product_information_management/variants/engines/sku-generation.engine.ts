// TODO
// 1. Load properties + values for product
// 2. cartesian_combinations(values_per_property)
// 3. For each combo:
//    - signature = build_option_signature(...)
//    - if exists (product_id, signature) → skip
//    - else insert product_skus + sku_option_values + inventory_levels row
// 4. Batch insert in chunks of 500 inside db.transaction()
// 5. Return { created, skipped, capped }
