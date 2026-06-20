CREATE TABLE `media` (
	`id` varchar(255) NOT NULL,
	`filename` varchar(512) NOT NULL,
	`original_name` varchar(512) NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`kind` varchar(32) NOT NULL DEFAULT 'image',
	`size` int NOT NULL DEFAULT 0,
	`width` int,
	`height` int,
	`url` varchar(2048) NOT NULL,
	`storage_key` varchar(2048) NOT NULL,
	`provider` varchar(64) NOT NULL DEFAULT 'local',
	`alt` varchar(512),
	`caption` text,
	`metadata` json DEFAULT ('{}'),
	`is_public` boolean NOT NULL DEFAULT true,
	`uploaded_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_usage` (
	`id` varchar(255) NOT NULL,
	`media_id` varchar(255) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` varchar(255) NOT NULL,
	`field` varchar(64),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_primary` boolean NOT NULL DEFAULT false,
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_usage_entity_media_uidx` UNIQUE(`media_id`,`entity_type`,`entity_id`,`field`)
);
--> statement-breakpoint
ALTER TABLE `media_usage` ADD CONSTRAINT `media_usage_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `media_kind_idx` ON `media` (`kind`);--> statement-breakpoint
CREATE INDEX `media_mime_type_idx` ON `media` (`mime_type`);--> statement-breakpoint
CREATE INDEX `media_uploaded_by_idx` ON `media` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);--> statement-breakpoint
CREATE INDEX `media_usage_entity_idx` ON `media_usage` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `media_usage_media_idx` ON `media_usage` (`media_id`);--> statement-breakpoint
CREATE INDEX `media_usage_sort_idx` ON `media_usage` (`entity_type`,`entity_id`,`sort_order`);