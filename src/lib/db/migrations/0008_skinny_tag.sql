ALTER TABLE `analytics_brand_daily` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_brand_daily` MODIFY COLUMN `brand_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_category_daily` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_customer_cohorts` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_daily_metrics` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `session_key` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `product_id` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `sku_id` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `brand_id` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `order_id` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `cart_id` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `campaign_id` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_funnel_daily` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_jobs` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_product_daily` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_product_daily` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_product_daily` MODIFY COLUMN `brand_id` varchar(255);--> statement-breakpoint
ALTER TABLE `analytics_search_daily` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_alert_rules` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_alerts` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_alerts` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_alerts` MODIFY COLUMN `warehouse_id` varchar(255) NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `inventory_forecast_jobs` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_forecast_snapshots` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_forecast_snapshots` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_forecast_snapshots` MODIFY COLUMN `warehouse_id` varchar(255) NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `inventory_sales_velocity_daily` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_sales_velocity_daily` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_sales_velocity_daily` MODIFY COLUMN `warehouse_id` varchar(255) NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `inventory_levels` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_levels` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_levels` MODIFY COLUMN `warehouse_id` varchar(255) NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `inventory_movements` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_movements` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_movements` MODIFY COLUMN `warehouse_id` varchar(255) NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `inventory_movements` MODIFY COLUMN `reference_id` varchar(255);--> statement-breakpoint
ALTER TABLE `inventory_reservations` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_reservations` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_reservations` MODIFY COLUMN `warehouse_id` varchar(255) NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `inventory_reservations` MODIFY COLUMN `cart_id` varchar(255);--> statement-breakpoint
ALTER TABLE `inventory_reservations` MODIFY COLUMN `order_id` varchar(255);--> statement-breakpoint
ALTER TABLE `cart_items` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `cart_items` MODIFY COLUMN `cart_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `cart_items` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `cart_items` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `cart_items` MODIFY COLUMN `reservation_id` varchar(255);--> statement-breakpoint
ALTER TABLE `cart_items` MODIFY COLUMN `preorder_allocation_id` varchar(255);--> statement-breakpoint
ALTER TABLE `carts` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `carts` MODIFY COLUMN `guest_token` varchar(255);--> statement-breakpoint
ALTER TABLE `customer_addresses` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `discount_codes` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_adjustments` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_adjustments` MODIFY COLUMN `order_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `order_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `reservation_id` varchar(255);--> statement-breakpoint
ALTER TABLE `order_items` MODIFY COLUMN `preorder_allocation_id` varchar(255);--> statement-breakpoint
ALTER TABLE `order_status_events` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `order_status_events` MODIFY COLUMN `order_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `cart_id` varchar(255);--> statement-breakpoint
ALTER TABLE `preorder_allocations` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `preorder_allocations` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `preorder_allocations` MODIFY COLUMN `warehouse_id` varchar(255) NOT NULL DEFAULT 'default';--> statement-breakpoint
ALTER TABLE `preorder_allocations` MODIFY COLUMN `order_id` varchar(255);--> statement-breakpoint
ALTER TABLE `preorder_allocations` MODIFY COLUMN `cart_id` varchar(255);--> statement-breakpoint
ALTER TABLE `preorder_allocations` MODIFY COLUMN `order_item_id` varchar(255);--> statement-breakpoint
ALTER TABLE `preorder_status_events` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `preorder_status_events` MODIFY COLUMN `allocation_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sku_preorder_settings` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `flash_sale_items` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `flash_sale_items` MODIFY COLUMN `flash_sale_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `flash_sale_items` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `flash_sale_items` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `flash_sales` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `flash_sales` MODIFY COLUMN `promotion_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_codes` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_codes` MODIFY COLUMN `promotion_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_bundle_items` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_bundle_items` MODIFY COLUMN `bundle_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_bundle_items` MODIFY COLUMN `product_id` varchar(255);--> statement-breakpoint
ALTER TABLE `promotion_bundle_items` MODIFY COLUMN `sku_id` varchar(255);--> statement-breakpoint
ALTER TABLE `promotion_bundles` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_bundles` MODIFY COLUMN `promotion_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_jobs` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_redemptions` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_redemptions` MODIFY COLUMN `promotion_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_redemptions` MODIFY COLUMN `promo_code_id` varchar(255);--> statement-breakpoint
ALTER TABLE `promotion_redemptions` MODIFY COLUMN `order_id` varchar(255);--> statement-breakpoint
ALTER TABLE `promotion_rules` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotion_rules` MODIFY COLUMN `promotion_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `promotions` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `brands` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_media` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_media` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_translations` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_translations` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_product_views` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_product_views` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_co_purchase_stats` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_co_purchase_stats` MODIFY COLUMN `product_a_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_co_purchase_stats` MODIFY COLUMN `product_b_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_recommendation_edges` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_recommendation_edges` MODIFY COLUMN `source_product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_recommendation_edges` MODIFY COLUMN `target_product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_trending_scores` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_trending_scores` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `recommendation_analytics_events` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `recommendation_analytics_events` MODIFY COLUMN `source_product_id` varchar(255);--> statement-breakpoint
ALTER TABLE `recommendation_analytics_events` MODIFY COLUMN `target_product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `recommendation_index_jobs` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_properties` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_properties` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_skus` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_skus` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `property_values` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `property_values` MODIFY COLUMN `property_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sku_option_values` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sku_option_values` MODIFY COLUMN `property_value_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sku_prices` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `sku_prices` MODIFY COLUMN `sku_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `wholesale_rules` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `wholesale_rules` MODIFY COLUMN `product_id` varchar(255);--> statement-breakpoint
ALTER TABLE `wholesale_rules` MODIFY COLUMN `sku_id` varchar(255);--> statement-breakpoint
ALTER TABLE `product_review_aggregates` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_review_helpful_votes` MODIFY COLUMN `review_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_review_moderation_events` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_review_moderation_events` MODIFY COLUMN `review_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_review_reports` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_review_reports` MODIFY COLUMN `review_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_reviews` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_reviews` MODIFY COLUMN `product_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `product_reviews` MODIFY COLUMN `order_id` varchar(255);--> statement-breakpoint
ALTER TABLE `product_reviews` MODIFY COLUMN `order_item_id` varchar(255);--> statement-breakpoint
ALTER TABLE `shipment_tracking_events` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `shipment_tracking_events` MODIFY COLUMN `shipment_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `shipments` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `shipments` MODIFY COLUMN `order_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_jobs` MODIFY COLUMN `id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_jobs` MODIFY COLUMN `shipment_id` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `assigned_operator_id` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `assigned_delivery_person_id` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_assigned_operator_id_users_id_fk` FOREIGN KEY (`assigned_operator_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_assigned_delivery_person_id_users_id_fk` FOREIGN KEY (`assigned_delivery_person_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `orders_operator_idx` ON `orders` (`assigned_operator_id`);--> statement-breakpoint
CREATE INDEX `orders_delivery_idx` ON `orders` (`assigned_delivery_person_id`);