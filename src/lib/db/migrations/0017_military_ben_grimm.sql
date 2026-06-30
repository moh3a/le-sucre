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
ALTER TABLE `users` ADD `phone` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_support_cases` ADD `source` varchar(32) DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `phone_uidx` UNIQUE(`phone`);--> statement-breakpoint
ALTER TABLE `user_addresses` ADD CONSTRAINT `user_addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX `user_addresses_user_id_idx` ON `user_addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_addresses_city_idx` ON `user_addresses` (`city`);--> statement-breakpoint
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
CREATE INDEX `suppliers_status_idx` ON `suppliers` (`status`);