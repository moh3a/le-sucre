CREATE TABLE `inventory_levels` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`warehouse_id` varchar(24) NOT NULL DEFAULT 'default',
	`quantity_on_hand` int NOT NULL DEFAULT 0,
	`quantity_reserved` int NOT NULL DEFAULT 0,
	`version` int NOT NULL DEFAULT 0,
	CONSTRAINT `inventory_levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_levels_sku_wh_uidx` UNIQUE(`sku_id`,`warehouse_id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`warehouse_id` varchar(24) NOT NULL DEFAULT 'default',
	`movement_type` varchar(32) NOT NULL,
	`quantity_delta` int NOT NULL,
	`reference_type` varchar(64),
	`reference_id` varchar(24),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_reservations` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`warehouse_id` varchar(24) NOT NULL DEFAULT 'default',
	`quantity` int NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'active',
	`cart_id` varchar(24),
	`order_id` varchar(24),
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_properties` (
	`id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_required` boolean NOT NULL DEFAULT true,
	CONSTRAINT `product_properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_properties_product_code_uidx` UNIQUE(`product_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `product_skus` (
	`id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`sku_code` varchar(128) NOT NULL,
	`option_signature` varchar(512) NOT NULL,
	`barcode` varchar(64),
	`base_price` decimal(12,2),
	`offer_price` decimal(12,2),
	`currency` varchar(3),
	`is_active` boolean NOT NULL DEFAULT true,
	`stock_available` int NOT NULL DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_skus_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_skus_sku_code_uidx` UNIQUE(`sku_code`),
	CONSTRAINT `product_skus_product_signature_uidx` UNIQUE(`product_id`,`option_signature`)
);
--> statement-breakpoint
CREATE TABLE `property_values` (
	`id` varchar(24) NOT NULL,
	`property_id` varchar(24) NOT NULL,
	`code` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	CONSTRAINT `property_values_id` PRIMARY KEY(`id`),
	CONSTRAINT `property_values_property_code_uidx` UNIQUE(`property_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `sku_option_values` (
	`sku_id` varchar(24) NOT NULL,
	`property_value_id` varchar(24) NOT NULL,
	CONSTRAINT `sku_option_values_sku_id_property_value_id_pk` PRIMARY KEY(`sku_id`,`property_value_id`)
);
--> statement-breakpoint
CREATE TABLE `sku_prices` (
	`id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`channel` varchar(32) NOT NULL DEFAULT 'retail',
	`min_quantity` int NOT NULL DEFAULT 1,
	`price` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`valid_from` timestamp,
	`valid_to` timestamp,
	CONSTRAINT `sku_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_rules` (
	`id` varchar(24) NOT NULL,
	`product_id` varchar(24),
	`sku_id` varchar(24),
	`min_quantity` int NOT NULL,
	`price` decimal(12,2),
	`discount_percent` decimal(5,2),
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `wholesale_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `has_variants` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_levels` ADD CONSTRAINT `inventory_levels_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_properties` ADD CONSTRAINT `product_properties_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_skus` ADD CONSTRAINT `product_skus_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `property_values` ADD CONSTRAINT `property_values_property_id_product_properties_id_fk` FOREIGN KEY (`property_id`) REFERENCES `product_properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_option_values` ADD CONSTRAINT `sku_option_values_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_option_values` ADD CONSTRAINT `sku_option_values_property_value_id_property_values_id_fk` FOREIGN KEY (`property_value_id`) REFERENCES `property_values`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sku_prices` ADD CONSTRAINT `sku_prices_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wholesale_rules` ADD CONSTRAINT `wholesale_rules_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wholesale_rules` ADD CONSTRAINT `wholesale_rules_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `inventory_movements_sku_idx` ON `inventory_movements` (`sku_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `inventory_reservations_sku_status_idx` ON `inventory_reservations` (`sku_id`,`status`);--> statement-breakpoint
CREATE INDEX `inventory_reservations_expires_idx` ON `inventory_reservations` (`expires_at`);--> statement-breakpoint
CREATE INDEX `product_skus_product_active_idx` ON `product_skus` (`product_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `product_skus_stock_idx` ON `product_skus` (`product_id`,`stock_available`);--> statement-breakpoint
CREATE INDEX `sku_option_values_value_idx` ON `sku_option_values` (`property_value_id`);--> statement-breakpoint
CREATE INDEX `sku_prices_lookup_idx` ON `sku_prices` (`sku_id`,`channel`,`min_quantity`);--> statement-breakpoint
CREATE INDEX `wholesale_rules_product_idx` ON `wholesale_rules` (`product_id`,`min_quantity`);--> statement-breakpoint
CREATE INDEX `wholesale_rules_sku_idx` ON `wholesale_rules` (`sku_id`,`min_quantity`);