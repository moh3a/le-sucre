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
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`),
	CONSTRAINT `warehouses_slug_uidx` UNIQUE(`slug`)
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
ALTER TABLE `return_requests` ADD CONSTRAINT `return_requests_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `return_requests_order_idx` ON `return_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `return_requests_status_idx` ON `return_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `return_requests_type_idx` ON `return_requests` (`type`,`status`);