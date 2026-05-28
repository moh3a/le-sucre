ALTER TABLE `product_translations`
ADD FULLTEXT INDEX `ft_product_translations_search` (
    `name`,
    `keywords`,
    `description`
);
--> statement-breakpoint
CREATE INDEX `products_catalog_filter_idx` ON `products` (
    `status`,
    `category_id`,
    `brand_id`,
    `is_featured`,
    `created_at`
);
--> statement-breakpoint
CREATE INDEX `product_skus_catalog_price_idx` ON `product_skus` (
    `product_id`,
    `is_active`,
    `stock_available`
);