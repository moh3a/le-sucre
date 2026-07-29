CREATE TABLE `analytics_brand_daily` (
	`id` varchar(255) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`brand_id` varchar(255) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`revenue` decimal(14,2) NOT NULL DEFAULT '0',
	`units_sold` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_brand_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_brand_daily_uidx` UNIQUE(`day_key`,`brand_id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_category_daily` (
	`id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`event_type` varchar(64) NOT NULL,
	`session_key` varchar(255),
	`user_id` varchar(255),
	`product_id` varchar(255),
	`sku_id` varchar(255),
	`category_id` varchar(255),
	`brand_id` varchar(255),
	`order_id` varchar(255),
	`cart_id` varchar(255),
	`search_query` varchar(512),
	`campaign_id` varchar(255),
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
	`id` varchar(255) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`step` varchar(32) NOT NULL,
	`sessions` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_funnel_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `analytics_funnel_daily_uidx` UNIQUE(`day_key`,`step`)
);
--> statement-breakpoint
CREATE TABLE `analytics_jobs` (
	`id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`category_id` varchar(255),
	`brand_id` varchar(255),
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
	`id` varchar(255) NOT NULL,
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
CREATE TABLE `accounts` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`password` text,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_provider_account_uidx` UNIQUE(`provider_id`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(255) NOT NULL,
	`actor_user_id` varchar(255),
	`action` varchar(100) NOT NULL,
	`resource_type` varchar(100),
	`resource_id` varchar(255),
	`metadata` text,
	`ip_address` varchar(45),
	`user_agent` varchar(1024),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_uidx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` varchar(255) NOT NULL,
	`permission_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_uidx` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` varchar(45),
	`user_agent` varchar(1024),
	`impersonated_by` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_uidx` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` varchar(255) NOT NULL,
	`role_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`phone` varchar(50),
	`image` varchar(2048),
	`is_active` boolean NOT NULL DEFAULT true,
	`is_anonymous` boolean NOT NULL DEFAULT false,
	`role` text,
	`banned` boolean,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_uidx` UNIQUE(`email`),
	CONSTRAINT `phone_uidx` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_addresses` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`label` varchar(100),
	`type` enum('shipping','billing','both') NOT NULL DEFAULT 'both',
	`first_name` varchar(255),
	`last_name` varchar(255),
	`company` varchar(255),
	`address_line_1` varchar(500),
	`address_line_2` varchar(500),
	`city` varchar(255),
	`state` varchar(255),
	`postal_code` varchar(50),
	`country` varchar(100) NOT NULL DEFAULT 'Algeria',
	`phone` varchar(50),
	`instructions` text,
	`is_default` boolean NOT NULL DEFAULT false,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`phone_secondary` varchar(50),
	`date_of_birth` date,
	`gender` enum('male','female','other'),
	`company` varchar(255),
	`tax_id` varchar(100),
	`vat_number` varchar(100),
	`default_billing_address_id` varchar(255),
	`default_shipping_address_id` varchar(255),
	`newsletter_opt_in` boolean NOT NULL DEFAULT false,
	`marketing_opt_in` boolean NOT NULL DEFAULT false,
	`sms_notifications` boolean NOT NULL DEFAULT false,
	`push_notifications` boolean NOT NULL DEFAULT true,
	`preferred_language` varchar(10) NOT NULL DEFAULT 'fr',
	`preferred_currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`bio` text,
	`notes` text,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `user_profiles_user_id_uidx` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` varchar(255) NOT NULL,
	`invoice_id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`sku_code` varchar(128) NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`tax_rate` decimal(4,2) NOT NULL DEFAULT '0.19',
	`tax_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`line_total` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(255) NOT NULL,
	`invoice_number` varchar(64) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`status` varchar(32) NOT NULL DEFAULT 'unpaid',
	`type` varchar(32) NOT NULL DEFAULT 'order_invoice',
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	`discount_total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`tax_total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`shipping_total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`grand_total` decimal(12,2) NOT NULL DEFAULT '0.00',
	`billing_address` json NOT NULL,
	`shipping_address` json NOT NULL,
	`vat_number` varchar(64),
	`metadata` json DEFAULT ('{}'),
	`due_at` timestamp,
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_number_uidx` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `campaign_analytics_daily` (
	`id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`banner_clicks` int NOT NULL DEFAULT 0,
	`add_to_cart` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`revenue` decimal(14,2) NOT NULL DEFAULT '0',
	`unique_visitors` int NOT NULL DEFAULT 0,
	`ctr` decimal(8,4) DEFAULT '0',
	`conversion_rate` decimal(8,4) DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_analytics_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_analytics_daily_uidx` UNIQUE(`campaign_id`,`day_key`)
);
--> statement-breakpoint
CREATE TABLE `campaign_banners` (
	`id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`banner_type` varchar(32) NOT NULL DEFAULT 'hero',
	`device_target` varchar(16) NOT NULL DEFAULT 'both',
	`image_url` varchar(2048),
	`mobile_image_url` varchar(2048),
	`video_url` varchar(2048),
	`link_url` varchar(2048),
	`link_target` varchar(16) NOT NULL DEFAULT '_self',
	`alt_text` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`placement` json DEFAULT ('[]'),
	`overlay_content` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_brands` (
	`id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`brand_id` varchar(255) NOT NULL,
	CONSTRAINT `campaign_brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_brands_uidx` UNIQUE(`campaign_id`,`brand_id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_categories` (
	`id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`category_id` varchar(255) NOT NULL,
	CONSTRAINT `campaign_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_categories_uidx` UNIQUE(`campaign_id`,`category_id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_jobs` (
	`id` varchar(255) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`campaign_id` varchar(255),
	`payload` json DEFAULT ('{}'),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`run_after` timestamp NOT NULL DEFAULT (now()),
	`attempts` int NOT NULL DEFAULT 0,
	`last_error` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_sections` (
	`id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`section_type` varchar(32) NOT NULL,
	`page_slug` varchar(255) NOT NULL DEFAULT 'home',
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`heading` json DEFAULT ('{}'),
	`config` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_targets` (
	`id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`target_type` varchar(32) NOT NULL,
	`target_value` varchar(255),
	`behavior_rule` varchar(64),
	`config` json DEFAULT ('{}'),
	`is_inclusive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `campaign_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_translations` (
	`id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`title` varchar(255),
	`subtitle` varchar(512),
	`cta_label` varchar(128),
	`cta_url` varchar(2048),
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	CONSTRAINT `campaign_translations_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaign_translations_campaign_locale_uidx` UNIQUE(`campaign_id`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`campaign_type` varchar(64) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`priority` int NOT NULL DEFAULT 100,
	`starts_at` timestamp,
	`ends_at` timestamp,
	`content` json DEFAULT ('{}'),
	`theme` json DEFAULT ('{}'),
	`promotion_id` varchar(255),
	`ab_test_group` varchar(64),
	`ab_traffic_split` int DEFAULT 100,
	`metadata` json DEFAULT ('{}'),
	`created_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaigns_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `database_history` (
	`id` varchar(255) NOT NULL,
	`operation_type` varchar(32) NOT NULL,
	`query` text,
	`table_name` varchar(255),
	`status` varchar(16) NOT NULL DEFAULT 'success',
	`rows_affected` varchar(16),
	`duration_ms` varchar(16),
	`error_message` text,
	`file_name` varchar(255),
	`file_format` varchar(16),
	`executed_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `database_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`reference_type` varchar(32),
	`reference_id` varchar(255),
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`category` varchar(64) NOT NULL DEFAULT 'general',
	`updated_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_tasks` (
	`id` varchar(255) NOT NULL,
	`task_type` varchar(32) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`reference_type` varchar(32),
	`reference_id` varchar(255),
	`assigned_to_user_id` varchar(255),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`priority` varchar(16) NOT NULL DEFAULT 'normal',
	`due_at` timestamp,
	`completed_at` timestamp,
	`completed_by_user_id` varchar(255),
	`completion_notes` text,
	`created_by_user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`locale` varchar(5) NOT NULL DEFAULT 'fr',
	`user_id` varchar(255),
	`ip_hash` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`name` json NOT NULL,
	`description` json DEFAULT ('{"en":"","fr":"","ar":""}'),
	`enabled` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `feature_flags_key_uidx` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `system_status` (
	`id` varchar(255) NOT NULL,
	`initialized` boolean NOT NULL DEFAULT false,
	`initialized_at` timestamp,
	`version` varchar(32),
	`admin_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_alert_rules` (
	`id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
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
	`id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
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
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
	`day_key` varchar(10) NOT NULL,
	`units_sold` int NOT NULL DEFAULT 0,
	`units_returned` int NOT NULL DEFAULT 0,
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_sales_velocity_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_velocity_day_uidx` UNIQUE(`sku_id`,`warehouse_id`,`day_key`)
);
--> statement-breakpoint
CREATE TABLE `inventory_adjustment_requests` (
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
	`adjustment_type` varchar(32) NOT NULL,
	`quantity_delta` int NOT NULL,
	`current_on_hand` int NOT NULL,
	`expected_on_hand` int NOT NULL,
	`reason` text NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`requested_by_user_id` varchar(255) NOT NULL,
	`reviewed_by_user_id` varchar(255),
	`review_note` varchar(512),
	`reviewed_at` timestamp,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_adjustment_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_levels` (
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
	`quantity_on_hand` int NOT NULL DEFAULT 0,
	`quantity_reserved` int NOT NULL DEFAULT 0,
	`version` int NOT NULL DEFAULT 0,
	CONSTRAINT `inventory_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_levels_sku_wh_uidx` UNIQUE(`sku_id`,`warehouse_id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
	`movement_type` varchar(32) NOT NULL,
	`quantity_delta` int NOT NULL,
	`reference_type` varchar(64),
	`reference_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_reservations` (
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
	`quantity` int NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'active',
	`cart_id` varchar(255),
	`order_id` varchar(255),
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`location` text,
	`phone` varchar(32),
	`email` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouses_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blacklisted_ips` (
	`id` varchar(255) NOT NULL,
	`ip_address` varchar(45) NOT NULL,
	`reason` text,
	`reason_fr` text,
	`reason_ar` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp(3),
	`created_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blacklisted_ips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` varchar(255) NOT NULL,
	`filename` varchar(512) NOT NULL,
	`original_name` varchar(512) NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`kind` varchar(32) NOT NULL DEFAULT 'image',
	`size` int NOT NULL DEFAULT 0,
	`width` int,
	`height` int,
	`url` varchar(2048) NOT NULL,
	`storage_key` varchar(2048) NOT NULL,
	`provider` varchar(64) NOT NULL DEFAULT 'local',
	`alt` varchar(512),
	`caption` text,
	`metadata` json DEFAULT ('{}'),
	`is_public` boolean NOT NULL DEFAULT true,
	`uploaded_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_usage` (
	`id` varchar(255) NOT NULL,
	`media_id` varchar(255) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` varchar(255) NOT NULL,
	`field` varchar(64),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_primary` boolean NOT NULL DEFAULT false,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_usage_entity_media_uidx` UNIQUE(`media_id`,`entity_type`,`entity_id`,`field`)
);
--> statement-breakpoint
CREATE TABLE `agent_kpi_daily` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`day_key` varchar(10) NOT NULL,
	`role` varchar(64) NOT NULL,
	`orders_processed` int NOT NULL DEFAULT 0,
	`orders_assigned` int NOT NULL DEFAULT 0,
	`cases_resolved` int NOT NULL DEFAULT 0,
	`tasks_completed` int NOT NULL DEFAULT 0,
	`calls_made` int NOT NULL DEFAULT 0,
	`avg_response_time_minutes` decimal(10,2),
	`customer_rating_avg` decimal(4,2),
	`sla_breaches` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_kpi_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_kpi_daily_user_day_uidx` UNIQUE(`user_id`,`day_key`)
);
--> statement-breakpoint
CREATE TABLE `approval_actions` (
	`id` varchar(255) NOT NULL,
	`request_id` varchar(255) NOT NULL,
	`step` int NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`action` varchar(32) NOT NULL,
	`comment` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approval_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` varchar(255) NOT NULL,
	`workflow_id` varchar(255) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` varchar(255) NOT NULL,
	`requested_by_user_id` varchar(255) NOT NULL,
	`current_step` int NOT NULL DEFAULT 0,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`notes` text,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approval_workflows` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`steps` json NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approval_workflows_id` PRIMARY KEY(`id`),
	CONSTRAINT `approval_workflows_entity_type_uidx` UNIQUE(`entity_type`)
);
--> statement-breakpoint
CREATE TABLE `fraud_reviews` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`risk_score` int NOT NULL DEFAULT 0,
	`flags` json NOT NULL DEFAULT ('[]'),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`reviewed_by_user_id` varchar(255),
	`decision` varchar(32),
	`decision_reason` text,
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fraud_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `fraud_reviews_order_uidx` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_transfer_items` (
	`id` varchar(255) NOT NULL,
	`transfer_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`received_quantity` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_transfer_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_transfers` (
	`id` varchar(255) NOT NULL,
	`transfer_number` varchar(64) NOT NULL,
	`source_warehouse_id` varchar(255) NOT NULL,
	`destination_warehouse_id` varchar(255) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`reason` varchar(64) NOT NULL,
	`notes` text,
	`shipped_at` timestamp,
	`received_at` timestamp,
	`created_by_user_id` varchar(255) NOT NULL,
	`approved_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_transfers_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_transfers_number_uidx` UNIQUE(`transfer_number`)
);
--> statement-breakpoint
CREATE TABLE `order_routing_rules` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`priority` int NOT NULL DEFAULT 100,
	`conditions` json NOT NULL,
	`assign_to_user_id` varchar(255),
	`assign_to_role` varchar(64),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_routing_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_reconciliation` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`transaction_reference` varchar(255),
	`bank_reference` varchar(255),
	`amount` decimal(14,2) NOT NULL,
	`fee` decimal(14,2) NOT NULL DEFAULT '0',
	`net_amount` decimal(14,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`payment_method` varchar(64),
	`status` varchar(32) NOT NULL DEFAULT 'unmatched',
	`matched_at` timestamp,
	`matched_by_user_id` varchar(255),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_reconciliation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` varchar(255) NOT NULL,
	`po_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`received_quantity` int NOT NULL DEFAULT 0,
	`unit_cost` decimal(12,2) NOT NULL,
	`total_cost` decimal(14,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purchase_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` varchar(255) NOT NULL,
	`po_number` varchar(64) NOT NULL,
	`supplier_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255),
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`subtotal` decimal(14,2) NOT NULL DEFAULT '0',
	`tax` decimal(14,2) NOT NULL DEFAULT '0',
	`total` decimal(14,2) NOT NULL DEFAULT '0',
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`notes` text,
	`expected_delivery_at` timestamp,
	`delivered_at` timestamp,
	`created_by_user_id` varchar(255) NOT NULL,
	`approved_by_user_id` varchar(255),
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_orders_po_number_uidx` UNIQUE(`po_number`)
);
--> statement-breakpoint
CREATE TABLE `rma_records` (
	`id` varchar(255) NOT NULL,
	`rma_number` varchar(64) NOT NULL,
	`return_request_id` varchar(255),
	`order_id` varchar(255) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'issued',
	`return_label_url` varchar(2048),
	`carrier` varchar(64),
	`tracking_number` varchar(128),
	`received_at` timestamp,
	`inspected_by_user_id` varchar(255),
	`inspection_notes` text,
	`disposition` varchar(32),
	`created_by_user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rma_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `rma_records_number_uidx` UNIQUE(`rma_number`)
);
--> statement-breakpoint
CREATE TABLE `sla_definitions` (
	`id` varchar(255) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`priority` varchar(16) NOT NULL,
	`response_hours` int NOT NULL,
	`resolution_hours` int NOT NULL,
	`escalation_minutes` int NOT NULL DEFAULT 30,
	`escalate_to_role` varchar(64),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sla_definitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sla_definitions_entity_priority_uidx` UNIQUE(`entity_type`,`priority`)
);
--> statement-breakpoint
CREATE TABLE `sla_tracking` (
	`id` varchar(255) NOT NULL,
	`sla_definition_id` varchar(255) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` varchar(255) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`started_at` timestamp NOT NULL,
	`response_due_at` timestamp,
	`resolution_due_at` timestamp,
	`responded_at` timestamp,
	`resolved_at` timestamp,
	`escalation_count` int NOT NULL DEFAULT 0,
	`last_escalated_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sla_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_products` (
	`id` varchar(255) NOT NULL,
	`supplier_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`supplier_sku` varchar(64),
	`unit_cost` decimal(12,2) NOT NULL,
	`lead_time_days` int NOT NULL DEFAULT 7,
	`min_order_qty` int NOT NULL DEFAULT 1,
	`is_preferred` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplier_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `supplier_products_supplier_product_uidx` UNIQUE(`supplier_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(32) NOT NULL,
	`contact_name` varchar(255),
	`email` varchar(255),
	`phone` varchar(32),
	`address` text,
	`payment_terms` varchar(64) DEFAULT 'net_30',
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`metadata` json DEFAULT ('{}'),
	`created_by_user_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`),
	CONSTRAINT `suppliers_code_uidx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` varchar(255) NOT NULL,
	`cart_id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unit_price` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`reservation_id` varchar(255),
	`fulfillment_type` varchar(32) NOT NULL DEFAULT 'standard',
	`preorder_allocation_id` varchar(255),
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_items_cart_sku_uidx` UNIQUE(`cart_id`,`sku_id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`guest_token` varchar(255),
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`channel` varchar(32) NOT NULL DEFAULT 'retail',
	`metadata` json DEFAULT ('{}'),
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_guest_token_uidx` UNIQUE(`guest_token`)
);
--> statement-breakpoint
CREATE TABLE `customer_contacts` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`order_id` varchar(255),
	`contact_type` varchar(32) NOT NULL,
	`direction` varchar(16) NOT NULL,
	`subject` varchar(255),
	`summary` text,
	`duration_seconds` int,
	`handled_by_user_id` varchar(255),
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_follow_ups` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`order_id` varchar(255),
	`follow_up_type` varchar(32) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`assigned_to_user_id` varchar(255),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`priority` varchar(16) NOT NULL DEFAULT 'normal',
	`scheduled_at` timestamp NOT NULL,
	`completed_at` timestamp,
	`completed_by_user_id` varchar(255),
	`result_notes` text,
	`created_by_user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_follow_ups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_notes` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`note_type` varchar(32) NOT NULL DEFAULT 'private',
	`content` text NOT NULL,
	`created_by_user_id` varchar(255) NOT NULL,
	`is_pinned` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_support_cases` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`order_id` varchar(255),
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'general',
	`source` varchar(32) NOT NULL DEFAULT 'internal',
	`priority` varchar(16) NOT NULL DEFAULT 'normal',
	`status` varchar(32) NOT NULL DEFAULT 'open',
	`assigned_to_user_id` varchar(255),
	`resolution` text,
	`resolved_by_user_id` varchar(255),
	`resolved_at` timestamp,
	`reopened_count` int NOT NULL DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`created_by_user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_support_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_support_messages` (
	`id` varchar(255) NOT NULL,
	`case_id` varchar(255) NOT NULL,
	`author_user_id` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_internal` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_support_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_assignments` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`assignment_type` varchar(32) NOT NULL,
	`from_user_id` varchar(255),
	`to_user_id` varchar(255) NOT NULL,
	`assigned_by_user_id` varchar(255) NOT NULL,
	`note` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_cancellation_requests` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`requested_by_user_id` varchar(255) NOT NULL,
	`reason` varchar(64) NOT NULL,
	`description` text,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`reviewed_by_user_id` varchar(255),
	`review_note` varchar(512),
	`reviewed_at` timestamp,
	`refund_processed` boolean NOT NULL DEFAULT false,
	`refund_amount` decimal(12,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_cancellation_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_comments` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`author_user_id` varchar(255) NOT NULL,
	`comment_type` varchar(32) NOT NULL DEFAULT 'internal',
	`content` text NOT NULL,
	`is_private` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_escalations` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`escalated_by_user_id` varchar(255) NOT NULL,
	`assigned_to_user_id` varchar(255),
	`reason` varchar(64) NOT NULL,
	`description` text,
	`priority` varchar(16) NOT NULL DEFAULT 'normal',
	`status` varchar(32) NOT NULL DEFAULT 'open',
	`resolution` text,
	`resolved_by_user_id` varchar(255),
	`resolved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_escalations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_holds` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`reason` varchar(64) NOT NULL,
	`description` text,
	`held_by_user_id` varchar(255) NOT NULL,
	`released_by_user_id` varchar(255),
	`released_at` timestamp,
	`released_reason` varchar(512),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_holds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_addresses` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`label` varchar(64) DEFAULT 'home',
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`line1` varchar(255) NOT NULL,
	`line2` varchar(255),
	`city` varchar(128) NOT NULL,
	`state` varchar(128),
	`postal_code` varchar(32),
	`country_code` varchar(2) NOT NULL DEFAULT 'DZ',
	`is_default_shipping` boolean NOT NULL DEFAULT false,
	`is_default_billing` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discount_codes` (
	`id` varchar(255) NOT NULL,
	`code` varchar(64) NOT NULL,
	`type` varchar(16) NOT NULL,
	`value` decimal(12,2) NOT NULL,
	`min_subtotal` decimal(12,2),
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discount_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `discount_codes_code_uidx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `order_adjustments` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`type` varchar(32) NOT NULL,
	`label` varchar(128) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`metadata` json DEFAULT ('{}'),
	CONSTRAINT `order_adjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`sku_code` varchar(128) NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`line_total` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`reservation_id` varchar(255),
	`fulfillment_type` varchar(32) NOT NULL DEFAULT 'standard',
	`preorder_status` varchar(32),
	`estimated_available_at` timestamp,
	`preorder_allocation_id` varchar(255),
	`payment_capture_mode` varchar(16) NOT NULL DEFAULT 'full',
	`metadata` json DEFAULT ('{}'),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_status_events` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`from_status` varchar(32),
	`to_status` varchar(32) NOT NULL,
	`actor_user_id` varchar(255),
	`note` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_status_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(255) NOT NULL,
	`order_number` varchar(32) NOT NULL,
	`user_id` varchar(255),
	`guest_email` varchar(255),
	`guest_phone` varchar(32),
	`cart_id` varchar(255),
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`channel` varchar(32) NOT NULL DEFAULT 'retail',
	`status` varchar(32) NOT NULL DEFAULT 'pending_payment',
	`payment_status` varchar(32) NOT NULL DEFAULT 'pending',
	`fulfillment_status` varchar(32) NOT NULL DEFAULT 'unfulfilled',
	`subtotal` decimal(12,2) NOT NULL,
	`discount_total` decimal(12,2) NOT NULL DEFAULT '0',
	`tax_total` decimal(12,2) NOT NULL DEFAULT '0',
	`shipping_total` decimal(12,2) NOT NULL DEFAULT '0',
	`grand_total` decimal(12,2) NOT NULL,
	`shipping_address` json NOT NULL,
	`billing_address` json,
	`idempotency_key` varchar(64),
	`payment_provider` varchar(32),
	`payment_reference` varchar(128),
	`shipment_provider` varchar(32),
	`shipment_reference` varchar(128),
	`metadata` json DEFAULT ('{}'),
	`notes` text,
	`placed_at` timestamp,
	`cancelled_at` timestamp,
	`assigned_operator_id` varchar(255),
	`assigned_delivery_person_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_uidx` UNIQUE(`order_number`),
	CONSTRAINT `orders_idempotency_uidx` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `preorder_allocations` (
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`warehouse_id` varchar(255) NOT NULL DEFAULT 'default',
	`order_id` varchar(255),
	`cart_id` varchar(255),
	`order_item_id` varchar(255),
	`quantity` int NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`estimated_available_at` timestamp,
	`fulfilled_at` timestamp,
	`user_id` varchar(255),
	`contact_name` varchar(255),
	`contact_email` varchar(255),
	`contact_phone` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preorder_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preorder_status_events` (
	`id` varchar(255) NOT NULL,
	`allocation_id` varchar(255) NOT NULL,
	`from_status` varchar(32),
	`to_status` varchar(32) NOT NULL,
	`note` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `preorder_status_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sku_preorder_settings` (
	`sku_id` varchar(255) NOT NULL,
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
CREATE TABLE `promotion_reviews` (
	`id` varchar(255) NOT NULL,
	`promotion_id` varchar(255) NOT NULL,
	`review_type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`reviewer_user_id` varchar(255),
	`review_note` varchar(512),
	`reviewed_at` timestamp,
	`requested_by_user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotion_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flash_sale_items` (
	`id` varchar(255) NOT NULL,
	`flash_sale_id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`flash_price` decimal(12,2) NOT NULL,
	`max_quantity` int NOT NULL,
	`sold_quantity` int NOT NULL DEFAULT 0,
	`version` int NOT NULL DEFAULT 0,
	CONSTRAINT `flash_sale_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `flash_sale_items_sale_sku_uidx` UNIQUE(`flash_sale_id`,`sku_id`)
);
--> statement-breakpoint
CREATE TABLE `flash_sales` (
	`id` varchar(255) NOT NULL,
	`promotion_id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`promotion_id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`bundle_id` varchar(255) NOT NULL,
	`product_id` varchar(255),
	`sku_id` varchar(255),
	`quantity` int NOT NULL DEFAULT 1,
	`is_required` boolean NOT NULL DEFAULT true,
	CONSTRAINT `promotion_bundle_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_bundles` (
	`id` varchar(255) NOT NULL,
	`promotion_id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`promotion_id` varchar(255) NOT NULL,
	`promo_code_id` varchar(255),
	`order_id` varchar(255),
	`user_id` varchar(255),
	`discount_amount` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotion_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion_rules` (
	`id` varchar(255) NOT NULL,
	`promotion_id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
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
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `return_requests` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`reason` text,
	`customer_note` text,
	`admin_note` text,
	`items` json NOT NULL,
	`replacement_order_id` varchar(255),
	`refund_amount` decimal(12,2),
	`requested_by_user_id` varchar(255),
	`reviewed_by_user_id` varchar(255),
	`reviewed_at` timestamp,
	`completed_at` timestamp,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `return_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warranty_requests` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`order_item_id` varchar(255),
	`product_id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`issue_type` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`technician_user_id` varchar(255),
	`technician_notes` text,
	`resolution_type` varchar(32),
	`resolution_notes` text,
	`resolution_date` timestamp,
	`reviewed_by_user_id` varchar(255),
	`reviewed_at` timestamp,
	`completed_at` timestamp,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warranty_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_audit_logs` (
	`id` varchar(255) NOT NULL,
	`transaction_id` varchar(255),
	`refund_id` varchar(255),
	`payout_id` varchar(255),
	`order_id` varchar(255),
	`actor_user_id` varchar(255),
	`action` varchar(64) NOT NULL,
	`resource_type` varchar(64) NOT NULL,
	`resource_id` varchar(255),
	`from_status` varchar(32),
	`to_status` varchar(32),
	`changes` json DEFAULT ('{}'),
	`metadata` json DEFAULT ('{}'),
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_partials` (
	`id` varchar(255) NOT NULL,
	`transaction_id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`installment_number` int,
	`total_installments` int,
	`percentage` decimal(5,2) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`paid_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`remaining_amount` decimal(12,2) NOT NULL,
	`due_at` timestamp NOT NULL,
	`paid_at` timestamp,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_partials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_payout_items` (
	`id` varchar(255) NOT NULL,
	`payout_id` varchar(255) NOT NULL,
	`order_item_id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`commission_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`net_amount` decimal(12,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_payout_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_payouts` (
	`id` varchar(255) NOT NULL,
	`vendor_id` varchar(255),
	`transaction_id` varchar(255),
	`order_id` varchar(255),
	`type` varchar(32) NOT NULL DEFAULT 'vendor_payout',
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`gross_amount` decimal(12,2) NOT NULL,
	`commission_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`commission_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`net_amount` decimal(12,2) NOT NULL,
	`fee` decimal(12,2) NOT NULL DEFAULT '0.00',
	`payout_method` varchar(64),
	`payout_reference` varchar(255),
	`provider_response` json DEFAULT ('{}'),
	`description` text,
	`failure_reason` text,
	`metadata` json DEFAULT ('{}'),
	`processed_at` timestamp,
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_refunds` (
	`id` varchar(255) NOT NULL,
	`transaction_id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`invoice_id` varchar(255),
	`provider_refund_id` varchar(255),
	`provider_response` json DEFAULT ('{}'),
	`type` varchar(32) NOT NULL DEFAULT 'full',
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`reason` text,
	`approved_by` varchar(255),
	`approved_at` timestamp,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`amount` decimal(12,2) NOT NULL,
	`fee_refunded` decimal(12,2) NOT NULL DEFAULT '0.00',
	`net_refunded` decimal(12,2) NOT NULL DEFAULT '0.00',
	`sku_refunds` json DEFAULT ('[]'),
	`failure_reason` text,
	`metadata` json DEFAULT ('{}'),
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_refunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`invoice_id` varchar(255),
	`provider` varchar(64) NOT NULL,
	`provider_transaction_id` varchar(255),
	`provider_payment_method` varchar(64),
	`provider_response` json DEFAULT ('{}'),
	`type` varchar(32) NOT NULL DEFAULT 'full',
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`amount` decimal(12,2) NOT NULL,
	`fee` decimal(12,2) NOT NULL DEFAULT '0.00',
	`net_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`refunded_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`failure_reason` text,
	`failure_code` varchar(64),
	`retry_count` int NOT NULL DEFAULT 0,
	`max_retries` int NOT NULL DEFAULT 3,
	`idempotency_key` varchar(128),
	`description` text,
	`metadata` json DEFAULT ('{}'),
	`captured_at` timestamp,
	`failed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_tx_idempotency_uidx` UNIQUE(`idempotency_key`),
	CONSTRAINT `payment_tx_provider_ref_uidx` UNIQUE(`provider`,`provider_transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `partial_payments` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`payment_number` int NOT NULL,
	`type` varchar(16) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`paid_at` timestamp,
	`payment_method` varchar(32),
	`payment_reference` varchar(128),
	`notes` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partial_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_verifications` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`verification_type` varchar(32) NOT NULL DEFAULT 'manual',
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`reference_number` varchar(128),
	`proof_url` varchar(2048),
	`notes` text,
	`verified_by_user_id` varchar(255),
	`verified_at` timestamp,
	`rejection_reason` varchar(512),
	`created_by_user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refund_requests` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`return_request_id` varchar(255),
	`cancellation_request_id` varchar(255),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`refund_method` varchar(32),
	`reason` text NOT NULL,
	`requested_by_user_id` varchar(255) NOT NULL,
	`approved_by_user_id` varchar(255),
	`approved_at` timestamp,
	`processed_by_user_id` varchar(255),
	`processed_at` timestamp,
	`provider_reference` varchar(128),
	`rejection_reason` varchar(512),
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `refund_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`website_url` varchar(2048),
	`logo_url` varchar(2048),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(255) NOT NULL,
	`parent_id` varchar(255),
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`path` varchar(2048) NOT NULL,
	`depth` int NOT NULL DEFAULT 0,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_change_log` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`change_type` varchar(32) NOT NULL,
	`field_name` varchar(64) NOT NULL,
	`old_value` text,
	`new_value` text,
	`changed_by_user_id` varchar(255),
	`notes` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_change_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_publishing_schedule` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`action` varchar(32) NOT NULL,
	`scheduled_at` timestamp NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`executed_at` timestamp,
	`cancelled_by_user_id` varchar(255),
	`cancel_reason` varchar(512),
	`created_by_user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_publishing_schedule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_media` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`filename` varchar(255),
	`mime_type` varchar(128),
	`kind` varchar(32) NOT NULL DEFAULT 'image',
	`alt` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_translations` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`keywords` varchar(512),
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	CONSTRAINT `product_translations_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_translations_product_locale_uidx` UNIQUE(`product_id`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `product_units` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`channel` varchar(32) NOT NULL,
	`unit_name` varchar(128) NOT NULL,
	`pieces_per_unit` int NOT NULL DEFAULT 1,
	`base_price` decimal(12,2) NOT NULL,
	`offer_price` decimal(12,2),
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_units_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_units_product_channel_uidx` UNIQUE(`product_id`,`channel`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(255) NOT NULL,
	`sku` varchar(64) NOT NULL,
	`has_variants` boolean NOT NULL DEFAULT false,
	`slug` varchar(255) NOT NULL,
	`category_id` varchar(255) NOT NULL,
	`brand_id` varchar(255),
	`base_price` decimal(12,2) NOT NULL,
	`offer_price` decimal(12,2),
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`is_featured` boolean NOT NULL DEFAULT false,
	`metadata` json DEFAULT ('{}'),
	`seo_title` varchar(255),
	`seo_description` varchar(500),
	`seo_keywords` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_uidx` UNIQUE(`slug`),
	CONSTRAINT `products_sku_uidx` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `customer_product_views` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`session_key` varchar(64),
	`product_id` varchar(255) NOT NULL,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_product_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_co_purchase_stats` (
	`id` varchar(255) NOT NULL,
	`product_a_id` varchar(255) NOT NULL,
	`product_b_id` varchar(255) NOT NULL,
	`pair_count` int NOT NULL DEFAULT 0,
	`score` decimal(8,4) NOT NULL DEFAULT '0',
	`window_days` int NOT NULL DEFAULT 90,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_co_purchase_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_co_purchase_pair_uidx` UNIQUE(`product_a_id`,`product_b_id`,`window_days`)
);
--> statement-breakpoint
CREATE TABLE `product_recommendation_edges` (
	`id` varchar(255) NOT NULL,
	`source_product_id` varchar(255) NOT NULL,
	`target_product_id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`event_type` varchar(32) NOT NULL,
	`slot_type` varchar(32) NOT NULL,
	`source_product_id` varchar(255),
	`target_product_id` varchar(255) NOT NULL,
	`user_id` varchar(255),
	`session_key` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendation_analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendation_index_jobs` (
	`id` varchar(255) NOT NULL,
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
CREATE TABLE `product_properties` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_required` boolean NOT NULL DEFAULT true,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `product_properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_properties_product_code_uidx` UNIQUE(`product_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `product_skus` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`sku_code` varchar(128) NOT NULL,
	`option_signature` varchar(512) NOT NULL,
	`barcode` varchar(64),
	`base_price` decimal(12,2),
	`offer_price` decimal(12,2),
	`wholesale_base_price` decimal(12,2),
	`wholesale_offer_price` decimal(12,2),
	`currency` varchar(3),
	`is_active` boolean NOT NULL DEFAULT true,
	`stock_available` int NOT NULL DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `product_skus_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_skus_sku_code_uidx` UNIQUE(`sku_code`),
	CONSTRAINT `product_skus_product_signature_uidx` UNIQUE(`product_id`,`option_signature`)
);
--> statement-breakpoint
CREATE TABLE `property_values` (
	`id` varchar(255) NOT NULL,
	`property_id` varchar(255) NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`thumbnail_image` varchar(1024),
	`color_hex` varchar(7),
	`metadata` json DEFAULT ('{}'),
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `property_values_id` PRIMARY KEY(`id`),
	CONSTRAINT `property_values_property_code_uidx` UNIQUE(`property_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `sku_option_values` (
	`sku_id` varchar(255) NOT NULL,
	`property_value_id` varchar(255) NOT NULL,
	CONSTRAINT `sku_option_values_sku_id_property_value_id_pk` PRIMARY KEY(`sku_id`,`property_value_id`)
);
--> statement-breakpoint
CREATE TABLE `sku_prices` (
	`id` varchar(255) NOT NULL,
	`sku_id` varchar(255) NOT NULL,
	`channel` varchar(32) NOT NULL DEFAULT 'retail',
	`min_quantity` int NOT NULL DEFAULT 1,
	`price` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`valid_from` timestamp,
	`valid_to` timestamp,
	CONSTRAINT `sku_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_review_aggregates` (
	`product_id` varchar(255) NOT NULL,
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
	`review_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_review_helpful_uidx` UNIQUE(`review_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `product_review_moderation_events` (
	`id` varchar(255) NOT NULL,
	`review_id` varchar(255) NOT NULL,
	`actor_user_id` varchar(255),
	`from_status` varchar(32),
	`to_status` varchar(32) NOT NULL,
	`note` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_review_moderation_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_review_reports` (
	`id` varchar(255) NOT NULL,
	`review_id` varchar(255) NOT NULL,
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
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`order_id` varchar(255),
	`order_item_id` varchar(255),
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
	`deleted_at` timestamp,
	`deleted_by` varchar(255),
	`restored_at` timestamp,
	`restored_by` varchar(255),
	CONSTRAINT `product_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_reviews_user_product_uidx` UNIQUE(`user_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_attempts` (
	`id` varchar(255) NOT NULL,
	`shipment_id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`attempt_number` int NOT NULL,
	`status` varchar(32) NOT NULL,
	`description` varchar(512),
	`delivery_person_id` varchar(255),
	`attempted_at` timestamp NOT NULL,
	`next_attempt_at` timestamp,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipment_tracking_events` (
	`id` varchar(255) NOT NULL,
	`shipment_id` varchar(255) NOT NULL,
	`provider_event_id` varchar(128),
	`status` varchar(64) NOT NULL,
	`description` varchar(512),
	`location` varchar(255),
	`occurred_at` timestamp NOT NULL,
	`raw_payload` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipment_tracking_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipment_tracking_unique_event_uidx` UNIQUE(`shipment_id`,`provider_event_id`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`provider` varchar(32) NOT NULL,
	`provider_shipment_id` varchar(128),
	`tracking_number` varchar(128),
	`tracking_url` varchar(2048),
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`delivery_status` varchar(32) NOT NULL DEFAULT 'pending',
	`shipping_cost` decimal(12,2) NOT NULL DEFAULT '0',
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`recipient_name` varchar(255) NOT NULL,
	`recipient_phone` varchar(32) NOT NULL,
	`address_line1` varchar(255) NOT NULL,
	`address_line2` varchar(255),
	`city` varchar(128) NOT NULL,
	`state` varchar(128),
	`postal_code` varchar(32),
	`country_code` varchar(2) NOT NULL DEFAULT 'DZ',
	`package_weight_kg` decimal(8,3),
	`package_length_cm` int,
	`package_width_cm` int,
	`package_height_cm` int,
	`is_cod` boolean NOT NULL DEFAULT true,
	`cod_amount` decimal(12,2),
	`last_sync_at` timestamp,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipments_order_uidx` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `shipping_jobs` (
	`id` varchar(255) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`shipment_id` varchar(255),
	`provider` varchar(32),
	`payload` json DEFAULT ('{}'),
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`max_attempts` int NOT NULL DEFAULT 6,
	`run_at` timestamp NOT NULL,
	`last_error` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipping_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collection_items` (
	`id` varchar(255) NOT NULL,
	`collection_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`variant_id` varchar(255),
	`notes` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collection_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `collection_items_collection_product_uidx` UNIQUE(`collection_id`,`product_id`,`variant_id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` varchar(255) NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`cover_image_url` varchar(2048),
	`share_token` varchar(255),
	`is_public` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`item_count` int NOT NULL DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_customer_slug_uidx` UNIQUE(`customer_id`,`slug`),
	CONSTRAINT `collections_share_token_uidx` UNIQUE(`share_token`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` varchar(255) NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`product_id` varchar(255),
	`brand_id` varchar(255),
	`category_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorites_customer_product_uidx` UNIQUE(`customer_id`,`product_id`),
	CONSTRAINT `favorites_customer_brand_uidx` UNIQUE(`customer_id`,`brand_id`),
	CONSTRAINT `favorites_customer_category_uidx` UNIQUE(`customer_id`,`category_id`)
);
--> statement-breakpoint
CREATE TABLE `save_for_later` (
	`id` varchar(255) NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`variant_id` varchar(255),
	`quantity` int NOT NULL DEFAULT 1,
	`original_cart_item_id` varchar(255),
	`saved_date` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `save_for_later_id` PRIMARY KEY(`id`),
	CONSTRAINT `save_for_later_customer_product_uidx` UNIQUE(`customer_id`,`product_id`,`variant_id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_analytics_events` (
	`id` varchar(255) NOT NULL,
	`customer_id` varchar(255),
	`wishlist_id` varchar(255),
	`product_id` varchar(255),
	`event_type` varchar(64) NOT NULL,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` varchar(255) NOT NULL,
	`wishlist_id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`variant_id` varchar(255),
	`quantity` int NOT NULL DEFAULT 1,
	`priority` varchar(32) NOT NULL DEFAULT 'medium',
	`notes` text,
	`saved_price` decimal(12,2),
	`saved_currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`current_price` decimal(12,2),
	`price_history` json DEFAULT ('[]'),
	`is_purchased` boolean NOT NULL DEFAULT false,
	`purchased_at` timestamp,
	`purchased_in_order_id` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wishlist_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlist_items_wishlist_product_uidx` UNIQUE(`wishlist_id`,`product_id`,`variant_id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist_share_tokens` (
	`id` varchar(255) NOT NULL,
	`wishlist_id` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`permission` varchar(32) NOT NULL DEFAULT 'read',
	`expires_at` timestamp,
	`max_uses` int NOT NULL DEFAULT 0,
	`use_count` int NOT NULL DEFAULT 0,
	`created_by` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_share_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlist_share_tokens_token_uidx` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` varchar(255) NOT NULL,
	`customer_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`is_default` boolean NOT NULL DEFAULT false,
	`is_public` boolean NOT NULL DEFAULT false,
	`is_private` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`cover_image_url` varchar(2048),
	`metadata` json DEFAULT ('{}'),
	`item_count` int NOT NULL DEFAULT 0,
	`shared_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `wishlists_customer_slug_uidx` UNIQUE(`customer_id`,`slug`)
);
--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoice_items` ADD CONSTRAINT `invoice_items_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_analytics_daily` ADD CONSTRAINT `campaign_analytics_daily_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_banners` ADD CONSTRAINT `campaign_banners_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_brands` ADD CONSTRAINT `campaign_brands_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_brands` ADD CONSTRAINT `campaign_brands_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_categories` ADD CONSTRAINT `campaign_categories_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_categories` ADD CONSTRAINT `campaign_categories_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_jobs` ADD CONSTRAINT `campaign_jobs_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_sections` ADD CONSTRAINT `campaign_sections_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_targets` ADD CONSTRAINT `campaign_targets_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_translations` ADD CONSTRAINT `campaign_translations_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_forecast_snapshots` ADD CONSTRAINT `inventory_forecast_snapshots_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_sales_velocity_daily` ADD CONSTRAINT `inventory_sales_velocity_daily_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_levels` ADD CONSTRAINT `inventory_levels_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blacklisted_ips` ADD CONSTRAINT `blacklisted_ips_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_usage` ADD CONSTRAINT `media_usage_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_kpi_daily` ADD CONSTRAINT `agent_kpi_daily_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_actions` ADD CONSTRAINT `approval_actions_request_id_approval_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `approval_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `approval_requests` ADD CONSTRAINT `approval_requests_workflow_id_approval_workflows_id_fk` FOREIGN KEY (`workflow_id`) REFERENCES `approval_workflows`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fraud_reviews` ADD CONSTRAINT `fraud_reviews_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transfer_items` ADD CONSTRAINT `inventory_transfer_items_transfer_id_inventory_transfers_id_fk` FOREIGN KEY (`transfer_id`) REFERENCES `inventory_transfers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transfer_items` ADD CONSTRAINT `inventory_transfer_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transfers` ADD CONSTRAINT `inventory_transfers_source_warehouse_id_warehouses_id_fk` FOREIGN KEY (`source_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_transfers` ADD CONSTRAINT `inventory_transfers_destination_warehouse_id_warehouses_id_fk` FOREIGN KEY (`destination_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_reconciliation` ADD CONSTRAINT `payment_reconciliation_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_po_id_purchase_orders_id_fk` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_supplier_id_suppliers_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rma_records` ADD CONSTRAINT `rma_records_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sla_tracking` ADD CONSTRAINT `sla_tracking_sla_definition_id_sla_definitions_id_fk` FOREIGN KEY (`sla_definition_id`) REFERENCES `sla_definitions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplier_products` ADD CONSTRAINT `supplier_products_supplier_id_suppliers_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplier_products` ADD CONSTRAINT `supplier_products_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_carts_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_contacts` ADD CONSTRAINT `customer_contacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_contacts` ADD CONSTRAINT `customer_contacts_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_follow_ups` ADD CONSTRAINT `customer_follow_ups_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_follow_ups` ADD CONSTRAINT `customer_follow_ups_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_notes` ADD CONSTRAINT `customer_notes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_support_cases` ADD CONSTRAINT `customer_support_cases_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_support_cases` ADD CONSTRAINT `customer_support_cases_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_support_messages` ADD CONSTRAINT `customer_support_messages_case_id_customer_support_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `customer_support_cases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_assignments` ADD CONSTRAINT `order_assignments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_cancellation_requests` ADD CONSTRAINT `order_cancellation_requests_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_comments` ADD CONSTRAINT `order_comments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_escalations` ADD CONSTRAINT `order_escalations_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_holds` ADD CONSTRAINT `order_holds_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_adjustments` ADD CONSTRAINT `order_adjustments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_status_events` ADD CONSTRAINT `order_status_events_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_cart_id_carts_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_assigned_operator_id_users_id_fk` FOREIGN KEY (`assigned_operator_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_assigned_delivery_person_id_users_id_fk` FOREIGN KEY (`assigned_delivery_person_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preorder_allocations` ADD CONSTRAINT `preorder_allocations_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preorder_allocations` ADD CONSTRAINT `preorder_allocations_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preorder_status_events` ADD CONSTRAINT `preorder_status_events_allocation_id_preorder_allocations_id_fk` FOREIGN KEY (`allocation_id`) REFERENCES `preorder_allocations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_preorder_settings` ADD CONSTRAINT `sku_preorder_settings_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE `return_requests` ADD CONSTRAINT `return_requests_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warranty_requests` ADD CONSTRAINT `warranty_requests_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warranty_requests` ADD CONSTRAINT `warranty_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_audit_logs` ADD CONSTRAINT `payment_audit_logs_transaction_id_payment_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_audit_logs` ADD CONSTRAINT `payment_audit_logs_refund_id_payment_refunds_id_fk` FOREIGN KEY (`refund_id`) REFERENCES `payment_refunds`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_audit_logs` ADD CONSTRAINT `payment_audit_logs_payout_id_payment_payouts_id_fk` FOREIGN KEY (`payout_id`) REFERENCES `payment_payouts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_partials` ADD CONSTRAINT `payment_partials_transaction_id_payment_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_partials` ADD CONSTRAINT `payment_partials_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_payout_items` ADD CONSTRAINT `payment_payout_items_payout_id_payment_payouts_id_fk` FOREIGN KEY (`payout_id`) REFERENCES `payment_payouts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_payouts` ADD CONSTRAINT `payment_payouts_transaction_id_payment_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_payouts` ADD CONSTRAINT `payment_payouts_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_refunds` ADD CONSTRAINT `payment_refunds_transaction_id_payment_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_refunds` ADD CONSTRAINT `payment_refunds_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_refunds` ADD CONSTRAINT `payment_refunds_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_refunds` ADD CONSTRAINT `payment_refunds_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partial_payments` ADD CONSTRAINT `partial_payments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_verifications` ADD CONSTRAINT `payment_verifications_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refund_requests` ADD CONSTRAINT `refund_requests_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refund_requests` ADD CONSTRAINT `refund_requests_return_request_id_return_requests_id_fk` FOREIGN KEY (`return_request_id`) REFERENCES `return_requests`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_translations` ADD CONSTRAINT `product_translations_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_product_views` ADD CONSTRAINT `customer_product_views_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_product_views` ADD CONSTRAINT `customer_product_views_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_recommendation_edges` ADD CONSTRAINT `product_recommendation_edges_source_product_id_products_id_fk` FOREIGN KEY (`source_product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_recommendation_edges` ADD CONSTRAINT `product_recommendation_edges_target_product_id_products_id_fk` FOREIGN KEY (`target_product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_trending_scores` ADD CONSTRAINT `product_trending_scores_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_properties` ADD CONSTRAINT `product_properties_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_skus` ADD CONSTRAINT `product_skus_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `property_values` ADD CONSTRAINT `property_values_property_id_product_properties_id_fk` FOREIGN KEY (`property_id`) REFERENCES `product_properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_option_values` ADD CONSTRAINT `sku_option_values_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_option_values` ADD CONSTRAINT `sku_option_values_property_value_id_property_values_id_fk` FOREIGN KEY (`property_value_id`) REFERENCES `property_values`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_prices` ADD CONSTRAINT `sku_prices_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE `delivery_attempts` ADD CONSTRAINT `delivery_attempts_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipment_tracking_events` ADD CONSTRAINT `shipment_tracking_events_shipment_id_shipments_id_fk` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipping_jobs` ADD CONSTRAINT `shipping_jobs_shipment_id_shipments_id_fk` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_collection_id_collections_id_fk` FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_variant_id_product_skus_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_skus`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collections` ADD CONSTRAINT `collections_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `save_for_later` ADD CONSTRAINT `save_for_later_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `save_for_later` ADD CONSTRAINT `save_for_later_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `save_for_later` ADD CONSTRAINT `save_for_later_variant_id_product_skus_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_skus`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_analytics_events` ADD CONSTRAINT `wishlist_analytics_events_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_analytics_events` ADD CONSTRAINT `wishlist_analytics_events_wishlist_id_wishlists_id_fk` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_analytics_events` ADD CONSTRAINT `wishlist_analytics_events_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_wishlist_id_wishlists_id_fk` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_variant_id_product_skus_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_skus`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_share_tokens` ADD CONSTRAINT `wishlist_share_tokens_wishlist_id_wishlists_id_fk` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlist_share_tokens` ADD CONSTRAINT `wishlist_share_tokens_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wishlists` ADD CONSTRAINT `wishlists_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `analytics_events_type_day_idx` ON `analytics_events` (`event_type`,`day_key`);--> statement-breakpoint
CREATE INDEX `analytics_events_product_day_idx` ON `analytics_events` (`product_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `analytics_events_user_day_idx` ON `analytics_events` (`user_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `analytics_events_occurred_idx` ON `analytics_events` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_session_idx` ON `analytics_events` (`session_key`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_jobs_status_run_idx` ON `analytics_jobs` (`status`,`run_after`);--> statement-breakpoint
CREATE INDEX `analytics_product_daily_revenue_idx` ON `analytics_product_daily` (`day_key`,`revenue`);--> statement-breakpoint
CREATE INDEX `analytics_product_daily_views_idx` ON `analytics_product_daily` (`day_key`,`views`);--> statement-breakpoint
CREATE INDEX `analytics_search_daily_count_idx` ON `analytics_search_daily` (`day_key`,`search_count`);--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `role_permissions_permission_id_idx` ON `role_permissions` (`permission_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_roles_role_id_idx` ON `user_roles` (`role_id`);--> statement-breakpoint
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `user_addresses_user_id_idx` ON `user_addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_addresses_city_idx` ON `user_addresses` (`city`);--> statement-breakpoint
CREATE INDEX `invoice_items_invoice_idx` ON `invoice_items` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `invoice_items_sku_idx` ON `invoice_items` (`sku_id`);--> statement-breakpoint
CREATE INDEX `invoices_order_idx` ON `invoices` (`order_id`);--> statement-breakpoint
CREATE INDEX `invoices_user_idx` ON `invoices` (`user_id`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `invoices_type_idx` ON `invoices` (`type`);--> statement-breakpoint
CREATE INDEX `invoices_created_idx` ON `invoices` (`created_at`);--> statement-breakpoint
CREATE INDEX `invoices_deleted_idx` ON `invoices` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `campaign_analytics_daily_campaign_idx` ON `campaign_analytics_daily` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `campaign_analytics_daily_day_idx` ON `campaign_analytics_daily` (`day_key`);--> statement-breakpoint
CREATE INDEX `campaign_banners_campaign_idx` ON `campaign_banners` (`campaign_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `campaign_banners_sort_idx` ON `campaign_banners` (`campaign_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `campaign_banners_type_idx` ON `campaign_banners` (`banner_type`,`is_active`);--> statement-breakpoint
CREATE INDEX `campaign_brands_brand_idx` ON `campaign_brands` (`brand_id`);--> statement-breakpoint
CREATE INDEX `campaign_categories_category_idx` ON `campaign_categories` (`category_id`);--> statement-breakpoint
CREATE INDEX `campaign_jobs_status_run_idx` ON `campaign_jobs` (`status`,`run_after`);--> statement-breakpoint
CREATE INDEX `campaign_jobs_campaign_idx` ON `campaign_jobs` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `campaign_sections_campaign_idx` ON `campaign_sections` (`campaign_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `campaign_sections_page_sort_idx` ON `campaign_sections` (`page_slug`,`sort_order`);--> statement-breakpoint
CREATE INDEX `campaign_targets_campaign_idx` ON `campaign_targets` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `campaign_targets_type_idx` ON `campaign_targets` (`target_type`,`target_value`);--> statement-breakpoint
CREATE INDEX `campaign_translations_locale_idx` ON `campaign_translations` (`locale`);--> statement-breakpoint
CREATE INDEX `campaigns_type_status_idx` ON `campaigns` (`campaign_type`,`status`);--> statement-breakpoint
CREATE INDEX `campaigns_schedule_idx` ON `campaigns` (`status`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE INDEX `campaigns_priority_idx` ON `campaigns` (`priority`);--> statement-breakpoint
CREATE INDEX `campaigns_deleted_idx` ON `campaigns` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `db_history_type_idx` ON `database_history` (`operation_type`);--> statement-breakpoint
CREATE INDEX `db_history_status_idx` ON `database_history` (`status`);--> statement-breakpoint
CREATE INDEX `db_history_created_idx` ON `database_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_user_unread_idx` ON `notifications` (`user_id`,`is_read`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `settings_key_uidx` ON `settings` (`key`);--> statement-breakpoint
CREATE INDEX `settings_category_idx` ON `settings` (`category`);--> statement-breakpoint
CREATE INDEX `admin_tasks_assigned_idx` ON `admin_tasks` (`assigned_to_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_type_status_idx` ON `admin_tasks` (`task_type`,`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_due_idx` ON `admin_tasks` (`due_at`,`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_reference_idx` ON `admin_tasks` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `contact_messages_created_idx` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `contact_messages_email_idx` ON `contact_messages` (`email`);--> statement-breakpoint
CREATE INDEX `feature_flags_deleted_idx` ON `feature_flags` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `inventory_alert_rules_active_idx` ON `inventory_alert_rules` (`is_active`);--> statement-breakpoint
CREATE INDEX `inventory_alerts_status_created_idx` ON `inventory_alerts` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `inventory_alerts_sku_idx` ON `inventory_alerts` (`sku_id`,`alert_type`,`status`);--> statement-breakpoint
CREATE INDEX `inventory_forecast_jobs_status_run_idx` ON `inventory_forecast_jobs` (`status`,`run_after`);--> statement-breakpoint
CREATE INDEX `inventory_forecast_risk_idx` ON `inventory_forecast_snapshots` (`risk_level`,`computed_at`);--> statement-breakpoint
CREATE INDEX `inventory_forecast_stockout_idx` ON `inventory_forecast_snapshots` (`days_until_stockout`);--> statement-breakpoint
CREATE INDEX `inventory_velocity_sku_day_idx` ON `inventory_sales_velocity_daily` (`sku_id`,`day_key`);--> statement-breakpoint
CREATE INDEX `inventory_adjustment_requests_sku_idx` ON `inventory_adjustment_requests` (`sku_id`);--> statement-breakpoint
CREATE INDEX `inventory_adjustment_requests_status_idx` ON `inventory_adjustment_requests` (`status`);--> statement-breakpoint
CREATE INDEX `inventory_adjustment_requests_requested_by_idx` ON `inventory_adjustment_requests` (`requested_by_user_id`);--> statement-breakpoint
CREATE INDEX `inventory_movements_sku_idx` ON `inventory_movements` (`sku_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `inventory_reservations_sku_status_idx` ON `inventory_reservations` (`sku_id`,`status`);--> statement-breakpoint
CREATE INDEX `inventory_reservations_expires_idx` ON `inventory_reservations` (`expires_at`);--> statement-breakpoint
CREATE INDEX `warehouses_deleted_idx` ON `warehouses` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `blacklisted_ips_ip_idx` ON `blacklisted_ips` (`ip_address`);--> statement-breakpoint
CREATE INDEX `blacklisted_ips_active_idx` ON `blacklisted_ips` (`is_active`);--> statement-breakpoint
CREATE INDEX `blacklisted_ips_expires_idx` ON `blacklisted_ips` (`expires_at`);--> statement-breakpoint
CREATE INDEX `media_kind_idx` ON `media` (`kind`);--> statement-breakpoint
CREATE INDEX `media_mime_type_idx` ON `media` (`mime_type`);--> statement-breakpoint
CREATE INDEX `media_uploaded_by_idx` ON `media` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);--> statement-breakpoint
CREATE INDEX `media_usage_entity_idx` ON `media_usage` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `media_usage_media_idx` ON `media_usage` (`media_id`);--> statement-breakpoint
CREATE INDEX `media_usage_sort_idx` ON `media_usage` (`entity_type`,`entity_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `agent_kpi_daily_role_day_idx` ON `agent_kpi_daily` (`role`,`day_key`);--> statement-breakpoint
CREATE INDEX `approval_actions_request_idx` ON `approval_actions` (`request_id`,`step`);--> statement-breakpoint
CREATE INDEX `approval_requests_entity_idx` ON `approval_requests` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `approval_requests_status_idx` ON `approval_requests` (`status`,`current_step`);--> statement-breakpoint
CREATE INDEX `approval_requests_workflow_idx` ON `approval_requests` (`workflow_id`);--> statement-breakpoint
CREATE INDEX `fraud_reviews_status_score_idx` ON `fraud_reviews` (`status`,`risk_score`);--> statement-breakpoint
CREATE INDEX `inventory_transfer_items_transfer_idx` ON `inventory_transfer_items` (`transfer_id`);--> statement-breakpoint
CREATE INDEX `inventory_transfers_source_idx` ON `inventory_transfers` (`source_warehouse_id`,`status`);--> statement-breakpoint
CREATE INDEX `inventory_transfers_dest_idx` ON `inventory_transfers` (`destination_warehouse_id`,`status`);--> statement-breakpoint
CREATE INDEX `order_routing_rules_priority_idx` ON `order_routing_rules` (`is_active`,`priority`);--> statement-breakpoint
CREATE INDEX `reconciliation_order_idx` ON `payment_reconciliation` (`order_id`);--> statement-breakpoint
CREATE INDEX `reconciliation_status_idx` ON `payment_reconciliation` (`status`);--> statement-breakpoint
CREATE INDEX `reconciliation_reference_idx` ON `payment_reconciliation` (`transaction_reference`,`bank_reference`);--> statement-breakpoint
CREATE INDEX `purchase_order_items_po_idx` ON `purchase_order_items` (`po_id`);--> statement-breakpoint
CREATE INDEX `purchase_orders_supplier_idx` ON `purchase_orders` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `purchase_orders_status_idx` ON `purchase_orders` (`status`);--> statement-breakpoint
CREATE INDEX `rma_records_order_idx` ON `rma_records` (`order_id`);--> statement-breakpoint
CREATE INDEX `rma_records_status_idx` ON `rma_records` (`status`);--> statement-breakpoint
CREATE INDEX `sla_tracking_entity_status_idx` ON `sla_tracking` (`entity_type`,`entity_id`,`status`);--> statement-breakpoint
CREATE INDEX `sla_tracking_due_idx` ON `sla_tracking` (`status`,`response_due_at`);--> statement-breakpoint
CREATE INDEX `supplier_products_product_idx` ON `supplier_products` (`product_id`);--> statement-breakpoint
CREATE INDEX `suppliers_status_idx` ON `suppliers` (`status`);--> statement-breakpoint
CREATE INDEX `cart_items_cart_idx` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE INDEX `cart_items_preorder_alloc_idx` ON `cart_items` (`preorder_allocation_id`);--> statement-breakpoint
CREATE INDEX `carts_user_status_idx` ON `carts` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `customer_contacts_user_idx` ON `customer_contacts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `customer_contacts_order_idx` ON `customer_contacts` (`order_id`);--> statement-breakpoint
CREATE INDEX `customer_contacts_handled_by_idx` ON `customer_contacts` (`handled_by_user_id`);--> statement-breakpoint
CREATE INDEX `customer_follow_ups_user_idx` ON `customer_follow_ups` (`user_id`);--> statement-breakpoint
CREATE INDEX `customer_follow_ups_assigned_idx` ON `customer_follow_ups` (`assigned_to_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `customer_follow_ups_schedule_idx` ON `customer_follow_ups` (`scheduled_at`,`status`);--> statement-breakpoint
CREATE INDEX `customer_notes_user_idx` ON `customer_notes` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `customer_notes_created_by_idx` ON `customer_notes` (`created_by_user_id`);--> statement-breakpoint
CREATE INDEX `customer_support_cases_user_idx` ON `customer_support_cases` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `customer_support_cases_assigned_idx` ON `customer_support_cases` (`assigned_to_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `customer_support_cases_status_priority_idx` ON `customer_support_cases` (`status`,`priority`);--> statement-breakpoint
CREATE INDEX `customer_support_messages_case_idx` ON `customer_support_messages` (`case_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `order_assignments_order_idx` ON `order_assignments` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `order_assignments_to_user_idx` ON `order_assignments` (`to_user_id`,`assignment_type`);--> statement-breakpoint
CREATE INDEX `order_cancellation_requests_order_idx` ON `order_cancellation_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_cancellation_requests_status_idx` ON `order_cancellation_requests` (`status`);--> statement-breakpoint
CREATE INDEX `order_comments_order_idx` ON `order_comments` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `order_comments_author_idx` ON `order_comments` (`author_user_id`);--> statement-breakpoint
CREATE INDEX `order_escalations_order_idx` ON `order_escalations` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_escalations_status_priority_idx` ON `order_escalations` (`status`,`priority`);--> statement-breakpoint
CREATE INDEX `order_holds_order_active_idx` ON `order_holds` (`order_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `order_holds_held_by_idx` ON `order_holds` (`held_by_user_id`);--> statement-breakpoint
CREATE INDEX `customer_addresses_user_idx` ON `customer_addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `order_adjustments_order_idx` ON `order_adjustments` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_preorder_status_idx` ON `order_items` (`preorder_status`);--> statement-breakpoint
CREATE INDEX `order_items_preorder_alloc_idx` ON `order_items` (`preorder_allocation_id`);--> statement-breakpoint
CREATE INDEX `order_status_events_order_idx` ON `order_status_events` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_user_created_idx` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_operator_idx` ON `orders` (`assigned_operator_id`);--> statement-breakpoint
CREATE INDEX `orders_delivery_idx` ON `orders` (`assigned_delivery_person_id`);--> statement-breakpoint
CREATE INDEX `preorder_allocations_sku_status_idx` ON `preorder_allocations` (`sku_id`,`status`);--> statement-breakpoint
CREATE INDEX `preorder_allocations_order_idx` ON `preorder_allocations` (`order_id`,`status`);--> statement-breakpoint
CREATE INDEX `preorder_allocations_cart_idx` ON `preorder_allocations` (`cart_id`);--> statement-breakpoint
CREATE INDEX `preorder_status_events_alloc_idx` ON `preorder_status_events` (`allocation_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `promotion_reviews_promotion_idx` ON `promotion_reviews` (`promotion_id`);--> statement-breakpoint
CREATE INDEX `promotion_reviews_status_idx` ON `promotion_reviews` (`status`);--> statement-breakpoint
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
CREATE INDEX `promotions_type_idx` ON `promotions` (`promotion_type`,`status`);--> statement-breakpoint
CREATE INDEX `promotions_deleted_idx` ON `promotions` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `return_requests_order_idx` ON `return_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `return_requests_status_idx` ON `return_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `return_requests_type_idx` ON `return_requests` (`type`,`status`);--> statement-breakpoint
CREATE INDEX `warranty_requests_order_idx` ON `warranty_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `warranty_requests_user_idx` ON `warranty_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `warranty_requests_technician_idx` ON `warranty_requests` (`technician_user_id`);--> statement-breakpoint
CREATE INDEX `warranty_requests_status_idx` ON `warranty_requests` (`status`);--> statement-breakpoint
CREATE INDEX `payment_audit_tx_idx` ON `payment_audit_logs` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `payment_audit_refund_idx` ON `payment_audit_logs` (`refund_id`);--> statement-breakpoint
CREATE INDEX `payment_audit_payout_idx` ON `payment_audit_logs` (`payout_id`);--> statement-breakpoint
CREATE INDEX `payment_audit_order_idx` ON `payment_audit_logs` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_audit_action_idx` ON `payment_audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `payment_audit_resource_idx` ON `payment_audit_logs` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE INDEX `payment_audit_created_idx` ON `payment_audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `payment_audit_actor_idx` ON `payment_audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `payment_partials_tx_idx` ON `payment_partials` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `payment_partials_order_idx` ON `payment_partials` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_partials_status_idx` ON `payment_partials` (`status`);--> statement-breakpoint
CREATE INDEX `payment_partials_due_idx` ON `payment_partials` (`due_at`);--> statement-breakpoint
CREATE INDEX `payout_items_payout_idx` ON `payment_payout_items` (`payout_id`);--> statement-breakpoint
CREATE INDEX `payout_items_sku_idx` ON `payment_payout_items` (`sku_id`);--> statement-breakpoint
CREATE INDEX `payment_payouts_vendor_idx` ON `payment_payouts` (`vendor_id`);--> statement-breakpoint
CREATE INDEX `payment_payouts_tx_idx` ON `payment_payouts` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `payment_payouts_order_idx` ON `payment_payouts` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_payouts_status_idx` ON `payment_payouts` (`status`);--> statement-breakpoint
CREATE INDEX `payment_payouts_type_idx` ON `payment_payouts` (`type`);--> statement-breakpoint
CREATE INDEX `payment_payouts_created_idx` ON `payment_payouts` (`created_at`);--> statement-breakpoint
CREATE INDEX `payment_refunds_tx_idx` ON `payment_refunds` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `payment_refunds_order_idx` ON `payment_refunds` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_refunds_user_idx` ON `payment_refunds` (`user_id`);--> statement-breakpoint
CREATE INDEX `payment_refunds_status_idx` ON `payment_refunds` (`status`);--> statement-breakpoint
CREATE INDEX `payment_refunds_type_idx` ON `payment_refunds` (`type`);--> statement-breakpoint
CREATE INDEX `payment_refunds_created_idx` ON `payment_refunds` (`created_at`);--> statement-breakpoint
CREATE INDEX `payment_tx_order_idx` ON `payment_transactions` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_tx_user_idx` ON `payment_transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `payment_tx_status_idx` ON `payment_transactions` (`status`);--> statement-breakpoint
CREATE INDEX `payment_tx_type_idx` ON `payment_transactions` (`type`);--> statement-breakpoint
CREATE INDEX `payment_tx_provider_idx` ON `payment_transactions` (`provider`);--> statement-breakpoint
CREATE INDEX `payment_tx_created_idx` ON `payment_transactions` (`created_at`);--> statement-breakpoint
CREATE INDEX `partial_payments_order_idx` ON `partial_payments` (`order_id`,`payment_number`);--> statement-breakpoint
CREATE INDEX `partial_payments_status_idx` ON `partial_payments` (`status`);--> statement-breakpoint
CREATE INDEX `payment_verifications_order_idx` ON `payment_verifications` (`order_id`);--> statement-breakpoint
CREATE INDEX `payment_verifications_status_idx` ON `payment_verifications` (`status`);--> statement-breakpoint
CREATE INDEX `refund_requests_order_idx` ON `refund_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `refund_requests_status_idx` ON `refund_requests` (`status`);--> statement-breakpoint
CREATE INDEX `brands_active_idx` ON `brands` (`is_active`);--> statement-breakpoint
CREATE INDEX `brands_deleted_idx` ON `brands` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `categories_path_idx` ON `categories` (`path`);--> statement-breakpoint
CREATE INDEX `categories_depth_idx` ON `categories` (`depth`);--> statement-breakpoint
CREATE INDEX `categories_active_sort_idx` ON `categories` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE INDEX `categories_deleted_idx` ON `categories` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `product_change_log_product_idx` ON `product_change_log` (`product_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_change_log_type_idx` ON `product_change_log` (`change_type`);--> statement-breakpoint
CREATE INDEX `product_publishing_schedule_product_idx` ON `product_publishing_schedule` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_publishing_schedule_status_idx` ON `product_publishing_schedule` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE INDEX `product_media_product_idx` ON `product_media` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_media_sort_idx` ON `product_media` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `product_translations_locale_idx` ON `product_translations` (`locale`);--> statement-breakpoint
CREATE INDEX `product_units_product_idx` ON `product_units` (`product_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand_id`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_price_idx` ON `products` (`base_price`);--> statement-breakpoint
CREATE INDEX `products_deleted_idx` ON `products` (`deleted_at`);--> statement-breakpoint
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
CREATE INDEX `product_properties_deleted_idx` ON `product_properties` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `product_skus_product_active_idx` ON `product_skus` (`product_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `product_skus_stock_idx` ON `product_skus` (`product_id`,`stock_available`);--> statement-breakpoint
CREATE INDEX `product_skus_deleted_idx` ON `product_skus` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `property_values_deleted_idx` ON `property_values` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `sku_option_values_value_idx` ON `sku_option_values` (`property_value_id`);--> statement-breakpoint
CREATE INDEX `sku_prices_lookup_idx` ON `sku_prices` (`sku_id`,`channel`,`min_quantity`);--> statement-breakpoint
CREATE INDEX `product_review_helpful_review_idx` ON `product_review_helpful_votes` (`review_id`);--> statement-breakpoint
CREATE INDEX `product_review_moderation_review_idx` ON `product_review_moderation_events` (`review_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_review_reports_review_idx` ON `product_review_reports` (`review_id`,`status`);--> statement-breakpoint
CREATE INDEX `product_reviews_product_status_created_idx` ON `product_reviews` (`product_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_reviews_product_status_rating_idx` ON `product_reviews` (`product_id`,`status`,`rating`);--> statement-breakpoint
CREATE INDEX `product_reviews_user_created_idx` ON `product_reviews` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_reviews_status_created_idx` ON `product_reviews` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_reviews_helpful_idx` ON `product_reviews` (`product_id`,`status`,`helpful_count`);--> statement-breakpoint
CREATE INDEX `product_reviews_deleted_idx` ON `product_reviews` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `delivery_attempts_shipment_idx` ON `delivery_attempts` (`shipment_id`,`attempt_number`);--> statement-breakpoint
CREATE INDEX `delivery_attempts_order_idx` ON `delivery_attempts` (`order_id`);--> statement-breakpoint
CREATE INDEX `shipment_tracking_shipment_time_idx` ON `shipment_tracking_events` (`shipment_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `shipments_provider_status_idx` ON `shipments` (`provider`,`status`);--> statement-breakpoint
CREATE INDEX `shipments_tracking_idx` ON `shipments` (`tracking_number`);--> statement-breakpoint
CREATE INDEX `shipments_delivery_status_idx` ON `shipments` (`delivery_status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `shipping_jobs_poll_idx` ON `shipping_jobs` (`status`,`run_at`);--> statement-breakpoint
CREATE INDEX `shipping_jobs_shipment_idx` ON `shipping_jobs` (`shipment_id`,`job_type`);--> statement-breakpoint
CREATE INDEX `collection_items_collection_idx` ON `collection_items` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_items_product_idx` ON `collection_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `collections_customer_idx` ON `collections` (`customer_id`);--> statement-breakpoint
CREATE INDEX `collections_public_idx` ON `collections` (`is_public`);--> statement-breakpoint
CREATE INDEX `collections_featured_idx` ON `collections` (`is_featured`);--> statement-breakpoint
CREATE INDEX `favorites_customer_idx` ON `favorites` (`customer_id`);--> statement-breakpoint
CREATE INDEX `favorites_product_idx` ON `favorites` (`product_id`);--> statement-breakpoint
CREATE INDEX `favorites_brand_idx` ON `favorites` (`brand_id`);--> statement-breakpoint
CREATE INDEX `favorites_category_idx` ON `favorites` (`category_id`);--> statement-breakpoint
CREATE INDEX `save_for_later_customer_idx` ON `save_for_later` (`customer_id`);--> statement-breakpoint
CREATE INDEX `save_for_later_product_idx` ON `save_for_later` (`product_id`);--> statement-breakpoint
CREATE INDEX `wishlist_analytics_events_customer_idx` ON `wishlist_analytics_events` (`customer_id`);--> statement-breakpoint
CREATE INDEX `wishlist_analytics_events_wishlist_idx` ON `wishlist_analytics_events` (`wishlist_id`);--> statement-breakpoint
CREATE INDEX `wishlist_analytics_events_product_idx` ON `wishlist_analytics_events` (`product_id`);--> statement-breakpoint
CREATE INDEX `wishlist_analytics_events_type_idx` ON `wishlist_analytics_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `wishlist_analytics_events_created_idx` ON `wishlist_analytics_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `wishlist_items_wishlist_idx` ON `wishlist_items` (`wishlist_id`);--> statement-breakpoint
CREATE INDEX `wishlist_items_product_idx` ON `wishlist_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `wishlist_items_priority_idx` ON `wishlist_items` (`priority`);--> statement-breakpoint
CREATE INDEX `wishlist_items_purchased_idx` ON `wishlist_items` (`is_purchased`);--> statement-breakpoint
CREATE INDEX `wishlist_share_tokens_wishlist_idx` ON `wishlist_share_tokens` (`wishlist_id`);--> statement-breakpoint
CREATE INDEX `wishlist_share_tokens_active_idx` ON `wishlist_share_tokens` (`is_active`);--> statement-breakpoint
CREATE INDEX `wishlists_customer_idx` ON `wishlists` (`customer_id`);--> statement-breakpoint
CREATE INDEX `wishlists_public_idx` ON `wishlists` (`is_public`);--> statement-breakpoint
CREATE INDEX `wishlists_default_idx` ON `wishlists` (`customer_id`,`is_default`);