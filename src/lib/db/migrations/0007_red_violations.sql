CREATE TABLE `analytics_brand_daily` (
	`id` varchar(24) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`brand_id` varchar(24) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`revenue` decimal(14,2) NOT NULL DEFAULT '0',
	`units_sold` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_brand_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_brand_daily_uidx` UNIQUE(`day_key`,`brand_id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_category_daily` (
	`id` varchar(24) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`category_id` varchar(255) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`revenue` decimal(14,2) NOT NULL DEFAULT '0',
	`units_sold` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_category_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_category_daily_uidx` UNIQUE(`day_key`,`category_id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_customer_cohorts` (
	`id` varchar(24) NOT NULL,
	`cohort_month` varchar(7) NOT NULL,
	`period_offset` int NOT NULL DEFAULT 0,
	`customers_count` int NOT NULL DEFAULT 0,
	`repeat_purchase_rate` decimal(8,4) DEFAULT '0',
	`revenue` decimal(14,2) NOT NULL DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_customer_cohorts_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_customer_cohorts_uidx` UNIQUE(`cohort_month`,`period_offset`)
);
--> statement-breakpoint
CREATE TABLE `analytics_daily_metrics` (
	`id` varchar(24) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`orders_count` int NOT NULL DEFAULT 0,
	`revenue` decimal(14,2) NOT NULL DEFAULT '0',
	`units_sold` int NOT NULL DEFAULT 0,
	`unique_visitors` int NOT NULL DEFAULT 0,
	`product_views` int NOT NULL DEFAULT 0,
	`add_to_cart` int NOT NULL DEFAULT 0,
	`checkout_started` int NOT NULL DEFAULT 0,
	`purchases` int NOT NULL DEFAULT 0,
	`abandoned_carts` int NOT NULL DEFAULT 0,
	`searches` int NOT NULL DEFAULT 0,
	`conversion_rate` decimal(8,4) DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_daily_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_daily_metrics_day_uidx` UNIQUE(`day_key`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` varchar(24) NOT NULL,
	`event_type` varchar(64) NOT NULL,
	`session_key` varchar(64),
	`user_id` varchar(255),
	`product_id` varchar(24),
	`sku_id` varchar(24),
	`category_id` varchar(255),
	`brand_id` varchar(24),
	`order_id` varchar(24),
	`cart_id` varchar(24),
	`search_query` varchar(512),
	`campaign_id` varchar(64),
	`slot_type` varchar(64),
	`revenue` decimal(12,2),
	`quantity` int,
	`metadata` json DEFAULT ('{}'),
	`day_key` varchar(10) NOT NULL,
	`occurred_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_funnel_daily` (
	`id` varchar(24) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`step` varchar(32) NOT NULL,
	`sessions` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_funnel_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_funnel_daily_uidx` UNIQUE(`day_key`,`step`)
);
--> statement-breakpoint
CREATE TABLE `analytics_jobs` (
	`id` varchar(24) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`payload` json DEFAULT ('{}'),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`run_after` timestamp NOT NULL DEFAULT (now()),
	`attempts` int NOT NULL DEFAULT 0,
	`last_error` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_product_daily` (
	`id` varchar(24) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`category_id` varchar(255),
	`brand_id` varchar(24),
	`views` int NOT NULL DEFAULT 0,
	`add_to_cart` int NOT NULL DEFAULT 0,
	`purchases` int NOT NULL DEFAULT 0,
	`units_sold` int NOT NULL DEFAULT 0,
	`revenue` decimal(14,2) NOT NULL DEFAULT '0',
	`clicks` int NOT NULL DEFAULT 0,
	`recommendation_clicks` int NOT NULL DEFAULT 0,
	`conversion_rate` decimal(8,4) DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_product_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_product_daily_uidx` UNIQUE(`day_key`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_search_daily` (
	`id` varchar(24) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`query_normalized` varchar(255) NOT NULL,
	`search_count` int NOT NULL DEFAULT 0,
	`zero_result_count` int NOT NULL DEFAULT 0,
	`click_through_count` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_search_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_search_daily_uidx` UNIQUE(`day_key`,`query_normalized`)
);
--> statement-breakpoint
CREATE TABLE `flash_sale_items` (
	`id` varchar(24) NOT NULL,
	`flash_sale_id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`flash_price` decimal(12,2) NOT NULL,
	`max_quantity` int NOT NULL,
	`sold_quantity` int NOT NULL DEFAULT 0,
	`version` int NOT NULL DEFAULT 0,
	CONSTRAINT `flash_sale_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `flash_sale_items_sale_sku_uidx` UNIQUE(`flash_sale_id`,`sku_id`)
);
--> statement-breakpoint
CREATE TABLE `flash_sales` (
	`id` varchar(24) NOT NULL,
	`promotion_id` varchar(24) NOT NULL,
	`title` varchar(255) NOT NULL,
	`starts_at` timestamp NOT NULL,
	`ends_at` timestamp NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'scheduled',
	`max_total_units` int,
	`sold_total_units` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flash_sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`id` varchar(24) NOT NULL,
	`promotion_id` varchar(24) NOT NULL,
	`code` varchar(64) NOT NULL,
	`usage_limit` int,
	`usage_count` int NOT NULL DEFAULT 0,
	`per_customer_limit` int DEFAULT 1,
	`is_active` boolean NOT NULL DEFAULT true,
	`starts_at` timestamp,
	`ends_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promo_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promo_codes_code_uidx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `promotion_bundle_items` (
	`id` varchar(24) NOT NULL,
	`bundle_id` varchar(24) NOT NULL,
	`product_id` varchar(24),
	`sku_id` varchar(24),
	`quantity` int NOT NULL DEFAULT 1,
	`is_required` boolean NOT NULL DEFAULT true,
	CONSTRAINT `promotion_bundle_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_bundles` (
	`id` varchar(24) NOT NULL,
	`promotion_id` varchar(24) NOT NULL,
	`name` varchar(255) NOT NULL,
	`bundle_type` varchar(32) NOT NULL,
	`bundle_price` decimal(12,2),
	`discount_percent` decimal(5,2),
	`buy_quantity` int,
	`get_quantity` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotion_bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_jobs` (
	`id` varchar(24) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`payload` json DEFAULT ('{}'),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`run_after` timestamp NOT NULL DEFAULT (now()),
	`attempts` int NOT NULL DEFAULT 0,
	`last_error` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotion_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_redemptions` (
	`id` varchar(24) NOT NULL,
	`promotion_id` varchar(24) NOT NULL,
	`promo_code_id` varchar(24),
	`order_id` varchar(24),
	`user_id` varchar(255),
	`discount_amount` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotion_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_rules` (
	`id` varchar(24) NOT NULL,
	`promotion_id` varchar(24) NOT NULL,
	`scope_type` varchar(32) NOT NULL,
	`scope_id` varchar(255),
	`discount_type` varchar(32) NOT NULL,
	`discount_value` decimal(12,2) NOT NULL DEFAULT '0',
	`min_subtotal` decimal(12,2),
	`min_quantity` int,
	`max_discount_amount` decimal(12,2),
	`buy_quantity` int,
	`get_quantity` int,
	`config` json DEFAULT ('{}'),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `promotion_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` varchar(24) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`promotion_type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`priority` int NOT NULL DEFAULT 100,
	`is_stackable` boolean NOT NULL DEFAULT false,
	`starts_at` timestamp,
	`ends_at` timestamp,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flash_sale_items` ADD CONSTRAINT `flash_sale_items_flash_sale_id_flash_sales_id_fk` FOREIGN KEY (`flash_sale_id`) REFERENCES `flash_sales`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flash_sale_items` ADD CONSTRAINT `flash_sale_items_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flash_sale_items` ADD CONSTRAINT `flash_sale_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `flash_sales` ADD CONSTRAINT `flash_sales_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promo_codes` ADD CONSTRAINT `promo_codes_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_bundle_items` ADD CONSTRAINT `promotion_bundle_items_bundle_id_promotion_bundles_id_fk` FOREIGN KEY (`bundle_id`) REFERENCES `promotion_bundles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_bundle_items` ADD CONSTRAINT `promotion_bundle_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_bundle_items` ADD CONSTRAINT `promotion_bundle_items_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_bundles` ADD CONSTRAINT `promotion_bundles_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_redemptions` ADD CONSTRAINT `promotion_redemptions_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_redemptions` ADD CONSTRAINT `promotion_redemptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promotion_rules` ADD CONSTRAINT `promotion_rules_promotion_id_promotions_id_fk` FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `analytics_events_type_day_idx` ON `analytics_events` (`event_type`,`day_key`);--> statement-breakpoint
CREATE INDEX `analytics_events_product_day_idx` ON `analytics_events` (`product_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `analytics_events_user_day_idx` ON `analytics_events` (`user_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `analytics_events_occurred_idx` ON `analytics_events` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_session_idx` ON `analytics_events` (`session_key`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_jobs_status_run_idx` ON `analytics_jobs` (`status`,`run_after`);--> statement-breakpoint
CREATE INDEX `analytics_product_daily_revenue_idx` ON `analytics_product_daily` (`day_key`,`revenue`);--> statement-breakpoint
CREATE INDEX `analytics_product_daily_views_idx` ON `analytics_product_daily` (`day_key`,`views`);--> statement-breakpoint
CREATE INDEX `analytics_search_daily_count_idx` ON `analytics_search_daily` (`day_key`,`search_count`);--> statement-breakpoint
CREATE INDEX `flash_sale_items_sku_idx` ON `flash_sale_items` (`sku_id`);--> statement-breakpoint
CREATE INDEX `flash_sales_status_schedule_idx` ON `flash_sales` (`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `flash_sales_promotion_idx` ON `flash_sales` (`promotion_id`);--> statement-breakpoint
CREATE INDEX `promo_codes_promotion_idx` ON `promo_codes` (`promotion_id`);--> statement-breakpoint
CREATE INDEX `promotion_bundle_items_bundle_idx` ON `promotion_bundle_items` (`bundle_id`);--> statement-breakpoint
CREATE INDEX `promotion_bundles_promotion_idx` ON `promotion_bundles` (`promotion_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `promotion_jobs_status_run_idx` ON `promotion_jobs` (`status`,`run_after`);--> statement-breakpoint
CREATE INDEX `promotion_redemptions_promotion_idx` ON `promotion_redemptions` (`promotion_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `promotion_redemptions_user_code_idx` ON `promotion_redemptions` (`user_id`,`promo_code_id`);--> statement-breakpoint
CREATE INDEX `promotion_rules_promotion_idx` ON `promotion_rules` (`promotion_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `promotion_rules_scope_idx` ON `promotion_rules` (`scope_type`,`scope_id`);--> statement-breakpoint
CREATE INDEX `promotions_status_schedule_idx` ON `promotions` (`status`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE INDEX `promotions_type_idx` ON `promotions` (`promotion_type`,`status`);