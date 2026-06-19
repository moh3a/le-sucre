CREATE TABLE `feature_flags` (
	`id` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`name` json NOT NULL,
	`description` json DEFAULT ('{"en":"","fr":"","ar":""}'),
	`enabled` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `feature_flags_key_uidx` UNIQUE(`key`)
);
