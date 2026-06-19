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
	`is_public` boolean NOT NULL DEFAULT false,
	`is_featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`item_count` int NOT NULL DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `collections_customer_slug_uidx` UNIQUE(`customer_id`,`slug`)
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
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE `delivery_attempts` ADD CONSTRAINT `delivery_attempts_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX `notifications_user_unread_idx` ON `notifications` (`user_id`,`is_read`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `admin_tasks_assigned_idx` ON `admin_tasks` (`assigned_to_user_id`,`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_type_status_idx` ON `admin_tasks` (`task_type`,`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_due_idx` ON `admin_tasks` (`due_at`,`status`);--> statement-breakpoint
CREATE INDEX `admin_tasks_reference_idx` ON `admin_tasks` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `inventory_adjustment_requests_sku_idx` ON `inventory_adjustment_requests` (`sku_id`);--> statement-breakpoint
CREATE INDEX `inventory_adjustment_requests_status_idx` ON `inventory_adjustment_requests` (`status`);--> statement-breakpoint
CREATE INDEX `inventory_adjustment_requests_requested_by_idx` ON `inventory_adjustment_requests` (`requested_by_user_id`);--> statement-breakpoint
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
CREATE INDEX `promotion_reviews_promotion_idx` ON `promotion_reviews` (`promotion_id`);--> statement-breakpoint
CREATE INDEX `promotion_reviews_status_idx` ON `promotion_reviews` (`status`);--> statement-breakpoint
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
CREATE INDEX `product_change_log_product_idx` ON `product_change_log` (`product_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `product_change_log_type_idx` ON `product_change_log` (`change_type`);--> statement-breakpoint
CREATE INDEX `product_publishing_schedule_product_idx` ON `product_publishing_schedule` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_publishing_schedule_status_idx` ON `product_publishing_schedule` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE INDEX `delivery_attempts_shipment_idx` ON `delivery_attempts` (`shipment_id`,`attempt_number`);--> statement-breakpoint
CREATE INDEX `delivery_attempts_order_idx` ON `delivery_attempts` (`order_id`);--> statement-breakpoint
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