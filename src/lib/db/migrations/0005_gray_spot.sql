CREATE TABLE `shipment_tracking_events` (
	`id` varchar(24) NOT NULL,
	`shipment_id` varchar(24) NOT NULL,
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
	`id` varchar(24) NOT NULL,
	`order_id` varchar(24) NOT NULL,
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
	`id` varchar(24) NOT NULL,
	`job_type` varchar(64) NOT NULL,
	`shipment_id` varchar(24),
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
ALTER TABLE `shipment_tracking_events` ADD CONSTRAINT `shipment_tracking_events_shipment_id_shipments_id_fk` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipping_jobs` ADD CONSTRAINT `shipping_jobs_shipment_id_shipments_id_fk` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `shipment_tracking_shipment_time_idx` ON `shipment_tracking_events` (`shipment_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `shipments_provider_status_idx` ON `shipments` (`provider`,`status`);--> statement-breakpoint
CREATE INDEX `shipments_tracking_idx` ON `shipments` (`tracking_number`);--> statement-breakpoint
CREATE INDEX `shipments_delivery_status_idx` ON `shipments` (`delivery_status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `shipping_jobs_poll_idx` ON `shipping_jobs` (`status`,`run_at`);--> statement-breakpoint
CREATE INDEX `shipping_jobs_shipment_idx` ON `shipping_jobs` (`shipment_id`,`job_type`);