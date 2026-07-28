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
DROP TABLE `wholesale_rules`;--> statement-breakpoint
ALTER TABLE `product_skus` ADD `wholesale_base_price` decimal(12,2);--> statement-breakpoint
ALTER TABLE `product_skus` ADD `wholesale_offer_price` decimal(12,2);--> statement-breakpoint
ALTER TABLE `product_units` ADD CONSTRAINT `product_units_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `product_units_product_idx` ON `product_units` (`product_id`);--> statement-breakpoint
ALTER TABLE `product_translations` DROP COLUMN `unit_name`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `pieces_per_unit`;