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
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaigns_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
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
CREATE INDEX `invoice_items_invoice_idx` ON `invoice_items` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `invoice_items_sku_idx` ON `invoice_items` (`sku_id`);--> statement-breakpoint
CREATE INDEX `invoices_order_idx` ON `invoices` (`order_id`);--> statement-breakpoint
CREATE INDEX `invoices_user_idx` ON `invoices` (`user_id`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `invoices_type_idx` ON `invoices` (`type`);--> statement-breakpoint
CREATE INDEX `invoices_created_idx` ON `invoices` (`created_at`);--> statement-breakpoint
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
CREATE INDEX `campaigns_priority_idx` ON `campaigns` (`priority`);