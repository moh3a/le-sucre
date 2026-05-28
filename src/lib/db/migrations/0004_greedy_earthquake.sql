CREATE TABLE `cart_items` (
	`id` varchar(24) NOT NULL,
	`cart_id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unit_price` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`reservation_id` varchar(24),
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `cart_items_cart_sku_uidx` UNIQUE(`cart_id`,`sku_id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` varchar(24) NOT NULL,
	`user_id` varchar(255),
	`guest_token` varchar(64),
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
CREATE TABLE `customer_addresses` (
	`id` varchar(24) NOT NULL,
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
	`id` varchar(24) NOT NULL,
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
	`id` varchar(24) NOT NULL,
	`order_id` varchar(24) NOT NULL,
	`type` varchar(32) NOT NULL,
	`label` varchar(128) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`metadata` json DEFAULT ('{}'),
	CONSTRAINT `order_adjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(24) NOT NULL,
	`order_id` varchar(24) NOT NULL,
	`sku_id` varchar(24) NOT NULL,
	`product_id` varchar(24) NOT NULL,
	`sku_code` varchar(128) NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(12,2) NOT NULL,
	`line_total` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'DZD',
	`reservation_id` varchar(24),
	`metadata` json DEFAULT ('{}'),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_status_events` (
	`id` varchar(24) NOT NULL,
	`order_id` varchar(24) NOT NULL,
	`from_status` varchar(32),
	`to_status` varchar(32) NOT NULL,
	`actor_user_id` varchar(255),
	`note` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_status_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(24) NOT NULL,
	`order_number` varchar(32) NOT NULL,
	`user_id` varchar(255),
	`guest_email` varchar(255),
	`cart_id` varchar(24),
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
	`placed_at` timestamp,
	`cancelled_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_uidx` UNIQUE(`order_number`),
	CONSTRAINT `orders_idempotency_uidx` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_carts_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_sku_id_product_skus_id_fk` FOREIGN KEY (`sku_id`) REFERENCES `product_skus`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carts` ADD CONSTRAINT `carts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_adjustments` ADD CONSTRAINT `order_adjustments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_status_events` ADD CONSTRAINT `order_status_events_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_cart_id_carts_id_fk` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `cart_items_cart_idx` ON `cart_items` (`cart_id`);--> statement-breakpoint
CREATE INDEX `carts_user_status_idx` ON `carts` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `customer_addresses_user_idx` ON `customer_addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `order_adjustments_order_idx` ON `order_adjustments` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_status_events_order_idx` ON `order_status_events` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_user_created_idx` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`,`created_at`);