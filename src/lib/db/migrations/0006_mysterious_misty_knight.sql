CREATE TABLE `inventory_alert_rules` (
	`id` varchar(24) NOT NULL,
	`scope_type` varchar(16) NOT NULL,
	`scope_id` varchar(255),
	`low_stock_threshold` int NOT NULL DEFAULT 5,
	`critical_stock_threshold` int NOT NULL DEFAULT 1,
	`days_until_stockout_warning` int NOT NULL DEFAULT 14,
	`reorder_point_multiplier` decimal(5,2) NOT NULL DEFAULT '1.5',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_alert_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_alert_rules_scope_uidx` UNIQUE(`scope_type`,`scope_id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_alerts` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`warehouse_id` varchar(24) NOT NULL DEFAULT 'default',
	`alert_type` varchar(32) NOT NULL,
	`severity` varchar(16) NOT NULL,
	`message` varchar(512) NOT NULL,
	`payload` json DEFAULT ('{}'),
	`status` varchar(16) NOT NULL DEFAULT 'open',
	`notified_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	CONSTRAINT `inventory_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_forecast_jobs` (
	`id` varchar(24) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`payload` json DEFAULT ('{}'),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`run_after` timestamp NOT NULL DEFAULT (now()),
	`last_error` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_forecast_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_forecast_snapshots` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`warehouse_id` varchar(24) NOT NULL DEFAULT 'default',
	`avg_daily_sales` decimal(10,4) NOT NULL DEFAULT '0',
	`trend_slope` decimal(10,6) NOT NULL DEFAULT '0',
	`days_until_stockout` decimal(10,2),
	`predicted_demand_30d` int NOT NULL DEFAULT 0,
	`recommended_reorder_qty` int NOT NULL DEFAULT 0,
	`safety_stock` int NOT NULL DEFAULT 0,
	`lead_time_days` int NOT NULL DEFAULT 7,
	`confidence` decimal(5,4) NOT NULL DEFAULT '0.5',
	`risk_level` varchar(16) NOT NULL DEFAULT 'normal',
	`signals` json DEFAULT ('{}'),
	`computed_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_forecast_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_forecast_snapshot_uidx` UNIQUE(`sku_id`,`warehouse_id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_sales_velocity_daily` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`warehouse_id` varchar(24) NOT NULL DEFAULT 'default',
	`day_key` varchar(10) NOT NULL,
	`units_sold` int NOT NULL DEFAULT 0,
	`units_returned` int NOT NULL DEFAULT 0,
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_sales_velocity_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_velocity_day_uidx` UNIQUE(`sku_id`,`warehouse_id`,`day_key`)
);
--> statement-breakpoint
CREATE TABLE `preorder_allocations` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`warehouse_id` varchar(24) NOT NULL DEFAULT 'default',
	`order_id` varchar(24),
	`cart_id` varchar(24),
	`order_item_id` varchar(24),
	`quantity` int NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`estimated_available_at` timestamp,
	`fulfilled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preorder_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preorder_status_events` (
	`id` varchar(24) NOT NULL,
	`allocation_id` varchar(24) NOT NULL,
	`from_status` varchar(32),
	`to_status` varchar(32) NOT NULL,
	`note` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `preorder_status_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sku_preorder_settings` (
	`sku_id` varchar(24) NOT NULL,
	`is_preorder_enabled` boolean NOT NULL DEFAULT false,
	`allow_backorder` boolean NOT NULL DEFAULT false,
	`max_preorder_qty` int,
	`preorder_sold` int NOT NULL DEFAULT 0,
	`estimated_available_at` timestamp,
	`deposit_percent` float(5,2) NOT NULL DEFAULT 100,
	`lead_time_days` int NOT NULL DEFAULT 14,
	`is_active` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sku_preorder_settings_sku_id` PRIMARY KEY(`sku_id`)
);
--> statement-breakpoint
CREATE TABLE `customer_product_views` (
	`id` varchar(24) NOT NULL,
	`user_id` varchar(255),
	`session_key` varchar(64),
	`product_id` varchar(24) NOT NULL,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_product_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_co_purchase_stats` (
	`id` varchar(24) NOT NULL,
	`product_a_id` varchar(24) NOT NULL,
	`product_b_id` varchar(24) NOT NULL,
	`pair_count` int NOT NULL DEFAULT 0,
	`score` decimal(8,4) NOT NULL DEFAULT '0',
	`window_days` int NOT NULL DEFAULT 90,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_co_purchase_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_co_purchase_pair_uidx` UNIQUE(`product_a_id`,`product_b_id`,`window_days`)
);
--> statement-breakpoint
CREATE TABLE `product_recommendation_edges` (
	`id` varchar(24) NOT NULL,
	`source_product_id` varchar(24) NOT NULL,
	`target_product_id` varchar(24) NOT NULL,
	`recommendation_type` varchar(32) NOT NULL,
	`score` decimal(8,4) NOT NULL,
	`rank` int NOT NULL,
	`signals` json DEFAULT ('{}'),
	`computed_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_recommendation_edges_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_rec_edges_uidx` UNIQUE(`source_product_id`,`target_product_id`,`recommendation_type`)
);
--> statement-breakpoint
CREATE TABLE `product_trending_scores` (
	`id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`period` varchar(16) NOT NULL,
	`period_key` varchar(16) NOT NULL,
	`view_count` int NOT NULL DEFAULT 0,
	`order_count` int NOT NULL DEFAULT 0,
	`score` decimal(10,4) NOT NULL DEFAULT '0',
	`rank` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_trending_scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_trending_uidx` UNIQUE(`product_id`,`period`,`period_key`)
);
--> statement-breakpoint
CREATE TABLE `recommendation_analytics_events` (
	`id` varchar(24) NOT NULL,
	`event_type` varchar(32) NOT NULL,
	`slot_type` varchar(32) NOT NULL,
	`source_product_id` varchar(24),
	`target_product_id` varchar(24) NOT NULL,
	`user_id` varchar(255),
	`session_key` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendation_analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendation_index_jobs` (
	`id` varchar(24) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`payload` json DEFAULT ('{}'),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`run_after` timestamp NOT NULL DEFAULT (now()),
	`last_error` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendation_index_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_review_aggregates` (
	`product_id` varchar(24) NOT NULL,
	`average_rating` decimal(4,2) NOT NULL DEFAULT '0',
	`review_count` int NOT NULL DEFAULT 0,
	`rating_1` int NOT NULL DEFAULT 0,
	`rating_2` int NOT NULL DEFAULT 0,
	`rating_3` int NOT NULL DEFAULT 0,
	`rating_4` int NOT NULL DEFAULT 0,
	`rating_5` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_review_aggregates_product_id` PRIMARY KEY(`product_id`)
);
--> statement-breakpoint
CREATE TABLE `product_review_helpful_votes` (
	`review_id` varchar(24) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_review_helpful_uidx` UNIQUE(`review_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `product_review_moderation_events` (
	`id` varchar(24) NOT NULL,
	`review_id` varchar(24) NOT NULL,
	`actor_user_id` varchar(255),
	`from_status` varchar(32),
	`to_status` varchar(32) NOT NULL,
	`note` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_review_moderation_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_review_reports` (
	`id` varchar(24) NOT NULL,
	`review_id` varchar(24) NOT NULL,
	`reporter_user_id` varchar(255) NOT NULL,
	`reason` varchar(64) NOT NULL,
	`details` varchar(1000),
	`status` varchar(32) NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_review_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_review_reports_unique_uidx` UNIQUE(`review_id`,`reporter_user_id`)
);
--> statement-breakpoint
CREATE TABLE `product_reviews` (
	`id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`order_id` varchar(24),
	`order_item_id` varchar(24),
	`rating` int NOT NULL,
	`title` varchar(255),
	`body` text NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`moderation_note` varchar(512),
	`is_verified_purchase` boolean NOT NULL DEFAULT false,
	`locale` varchar(5) NOT NULL DEFAULT 'fr',
	`helpful_count` int NOT NULL DEFAULT 0,
	`report_count` int NOT NULL DEFAULT 0,
	`content_hash` varchar(64) NOT NULL,
	`ip_hash` varchar(64),
	`approved_at` timestamp,
	`rejected_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_reviews_user_product_uidx` UNIQUE(`user_id`,`product_id`)
);
--> statement-breakpoint
ALTER TABLE `cart_items` ADD `fulfillment_type` varchar(32) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `cart_items` ADD `preorder_allocation_id` varchar(24);--> statement-breakpoint
ALTER TABLE `order_items` ADD `fulfillment_type` varchar(32) DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `preorder_status` varchar(32);--> statement-breakpoint
ALTER TABLE `order_items` ADD `estimated_available_at` timestamp;--> statement-breakpoint
ALTER TABLE `order_items` ADD `preorder_allocation_id` varchar(24);--> statement-breakpoint
ALTER TABLE `order_items` ADD `payment_capture_mode` varchar(16) DEFAULT 'full' NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_forecast_snapshots` ADD CONSTRAINT `inventory_forecast_snapshots_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_sales_velocity_daily` ADD CONSTRAINT `inventory_sales_velocity_daily_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preorder_allocations` ADD CONSTRAINT `preorder_allocations_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preorder_allocations` ADD CONSTRAINT `preorder_allocations_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preorder_status_events` ADD CONSTRAINT `preorder_status_events_allocation_id_preorder_allocations_id_fk` FOREIGN KEY (`allocation_id`) REFERENCES `preorder_allocations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_preorder_settings` ADD CONSTRAINT `sku_preorder_settings_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_product_views` ADD CONSTRAINT `customer_product_views_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_product_views` ADD CONSTRAINT `customer_product_views_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_recommendation_edges` ADD CONSTRAINT `product_recommendation_edges_source_product_id_products_id_fk` FOREIGN KEY (`source_product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_recommendation_edges` ADD CONSTRAINT `product_recommendation_edges_target_product_id_products_id_fk` FOREIGN KEY (`target_product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_trending_scores` ADD CONSTRAINT `product_trending_scores_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_review_aggregates` ADD CONSTRAINT `product_review_aggregates_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_review_helpful_votes` ADD CONSTRAINT `product_review_helpful_votes_review_id_product_reviews_id_fk` FOREIGN KEY (`review_id`) REFERENCES `product_reviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_review_helpful_votes` ADD CONSTRAINT `product_review_helpful_votes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_review_moderation_events` ADD CONSTRAINT `product_review_moderation_events_review_id_product_reviews_id_fk` FOREIGN KEY (`review_id`) REFERENCES `product_reviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_review_reports` ADD CONSTRAINT `product_review_reports_review_id_product_reviews_id_fk` FOREIGN KEY (`review_id`) REFERENCES `product_reviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_review_reports` ADD CONSTRAINT `product_review_reports_reporter_user_id_users_id_fk` FOREIGN KEY (`reporter_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_order_item_id_order_items_id_fk` FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `inventory_alert_rules_active_idx` ON `inventory_alert_rules` (`is_active`);--> statement-breakpoint
CREATE INDEX `inventory_alerts_status_created_idx` ON `inventory_alerts` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `inventory_alerts_sku_idx` ON `inventory_alerts` (`sku_id`,`alert_type`,`status`);--> statement-breakpoint
CREATE INDEX `inventory_forecast_jobs_status_run_idx` ON `inventory_forecast_jobs` (`status`,`run_after`);--> statement-breakpoint
CREATE INDEX `inventory_forecast_risk_idx` ON `inventory_forecast_snapshots` (`risk_level`,`computed_at`);--> statement-breakpoint
CREATE INDEX `inventory_forecast_stockout_idx` ON `inventory_forecast_snapshots` (`days_until_stockout`);--> statement-breakpoint
CREATE INDEX `inventory_velocity_sku_day_idx` ON `inventory_sales_velocity_daily` (`sku_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `preorder_allocations_sku_status_idx` ON `preorder_allocations` (`sku_id`,`status`);--> statement-breakpoint
CREATE INDEX `preorder_allocations_order_idx` ON `preorder_allocations` (`order_id`,`status`);--> statement-breakpoint
CREATE INDEX `preorder_allocations_cart_idx` ON `preorder_allocations` (`cart_id`);--> statement-breakpoint
CREATE INDEX `preorder_status_events_alloc_idx` ON `preorder_status_events` (`allocation_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `customer_product_views_user_viewed_idx` ON `customer_product_views` (`user_id`,`viewed_at`);--> statement-breakpoint
CREATE INDEX `customer_product_views_session_viewed_idx` ON `customer_product_views` (`session_key`,`viewed_at`);--> statement-breakpoint
CREATE INDEX `customer_product_views_product_idx` ON `customer_product_views` (`product_id`,`viewed_at`);--> statement-breakpoint
CREATE INDEX `product_co_purchase_a_score_idx` ON `product_co_purchase_stats` (`product_a_id`,`score`);--> statement-breakpoint
CREATE INDEX `product_co_purchase_b_score_idx` ON `product_co_purchase_stats` (`product_b_id`,`score`);--> statement-breakpoint
CREATE INDEX `product_rec_edges_source_type_rank_idx` ON `product_recommendation_edges` (`source_product_id`,`recommendation_type`,`rank`);--> statement-breakpoint
CREATE INDEX `product_rec_edges_target_idx` ON `product_recommendation_edges` (`target_product_id`);--> statement-breakpoint
CREATE INDEX `product_rec_edges_computed_idx` ON `product_recommendation_edges` (`computed_at`);--> statement-breakpoint
CREATE INDEX `product_trending_period_rank_idx` ON `product_trending_scores` (`period`,`period_key`,`rank`);--> statement-breakpoint
CREATE INDEX `product_trending_score_idx` ON `product_trending_scores` (`period`,`period_key`,`score`);--> statement-breakpoint
CREATE INDEX `rec_analytics_slot_created_idx` ON `recommendation_analytics_events` (`slot_type`,`created_at`);--> statement-breakpoint
CREATE INDEX `rec_analytics_target_idx` ON `recommendation_analytics_events` (`target_product_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `recommendation_jobs_status_run_idx` ON `recommendation_index_jobs` (`status`,`run_after`);--> statement-breakpoint
CREATE INDEX `recommendation_jobs_type_idx` ON `recommendation_index_jobs` (`job_type`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_review_helpful_review_idx` ON `product_review_helpful_votes` (`review_id`);--> statement-breakpoint
CREATE INDEX `product_review_moderation_review_idx` ON `product_review_moderation_events` (`review_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_review_reports_review_idx` ON `product_review_reports` (`review_id`,`status`);--> statement-breakpoint
CREATE INDEX `product_reviews_product_status_created_idx` ON `product_reviews` (`product_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_reviews_product_status_rating_idx` ON `product_reviews` (`product_id`,`status`,`rating`);--> statement-breakpoint
CREATE INDEX `product_reviews_user_created_idx` ON `product_reviews` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_reviews_status_created_idx` ON `product_reviews` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_reviews_helpful_idx` ON `product_reviews` (`product_id`,`status`,`helpful_count`);--> statement-breakpoint
CREATE INDEX `cart_items_preorder_alloc_idx` ON `cart_items` (`preorder_allocation_id`);--> statement-breakpoint
CREATE INDEX `order_items_preorder_status_idx` ON `order_items` (`preorder_status`);--> statement-breakpoint
CREATE INDEX `order_items_preorder_alloc_idx` ON `order_items` (`preorder_allocation_id`);