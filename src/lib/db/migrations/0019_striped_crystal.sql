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
ALTER TABLE `preorder_allocations` ADD `user_id` varchar(255);--> statement-breakpoint
ALTER TABLE `preorder_allocations` ADD `contact_name` varchar(255);--> statement-breakpoint
ALTER TABLE `preorder_allocations` ADD `contact_email` varchar(255);--> statement-breakpoint
ALTER TABLE `preorder_allocations` ADD `contact_phone` varchar(50);--> statement-breakpoint
ALTER TABLE `collections` ADD `share_token` varchar(255);--> statement-breakpoint
ALTER TABLE `collections` ADD CONSTRAINT `collections_share_token_uidx` UNIQUE(`share_token`);--> statement-breakpoint
CREATE INDEX `contact_messages_created_idx` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `contact_messages_email_idx` ON `contact_messages` (`email`);