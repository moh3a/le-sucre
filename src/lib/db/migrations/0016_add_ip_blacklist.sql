CREATE TABLE `blacklisted_ips` (
	`id` varchar(255) NOT NULL,
	`ip_address` varchar(45) NOT NULL,
	`reason` text,
	`reason_fr` text,
	`reason_ar` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp(3),
	`created_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blacklisted_ips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `blacklisted_ips` ADD CONSTRAINT `blacklisted_ips_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `blacklisted_ips_ip_idx` ON `blacklisted_ips` (`ip_address`);--> statement-breakpoint
CREATE INDEX `blacklisted_ips_active_idx` ON `blacklisted_ips` (`is_active`);--> statement-breakpoint
CREATE INDEX `blacklisted_ips_expires_idx` ON `blacklisted_ips` (`expires_at`);