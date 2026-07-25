CREATE TABLE `settings` (
	`id` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`category` varchar(64) NOT NULL DEFAULT 'general',
	`updated_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `settings_key_uidx` ON `settings` (`key`);--> statement-breakpoint
CREATE INDEX `settings_category_idx` ON `settings` (`category`);