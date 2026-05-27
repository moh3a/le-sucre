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
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` varchar(24) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`website_url` varchar(2048),
	`logo_url` varchar(2048),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brands_id` PRIMARY KEY(`id`),
	CONSTRAINT `brands_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `product_media` (
	`id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
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
	`id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
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
CREATE TABLE `products` (
	`id` varchar(24) NOT NULL,
	`sku` varchar(64) NOT NULL,
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
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_uidx` UNIQUE(`slug`),
	CONSTRAINT `products_sku_uidx` UNIQUE(`sku`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD `impersonated_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text;--> statement-breakpoint
ALTER TABLE `users` ADD `banned` boolean;--> statement-breakpoint
ALTER TABLE `users` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `ban_expires` timestamp(3);--> statement-breakpoint
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_translations` ADD CONSTRAINT `product_translations_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_brands_id_fk` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `categories_path_idx` ON `categories` (`path`);--> statement-breakpoint
CREATE INDEX `categories_depth_idx` ON `categories` (`depth`);--> statement-breakpoint
CREATE INDEX `categories_active_sort_idx` ON `categories` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE INDEX `brands_active_idx` ON `brands` (`is_active`);--> statement-breakpoint
CREATE INDEX `product_media_product_idx` ON `product_media` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_media_sort_idx` ON `product_media` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `product_translations_locale_idx` ON `product_translations` (`locale`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_brand_idx` ON `products` (`brand_id`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_price_idx` ON `products` (`base_price`);