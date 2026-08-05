CREATE TABLE `campaign_webhook_events` (
	`id` varchar(255) NOT NULL,
	`event_type` varchar(64) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`payload` json NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `campaign_webhook_events_type_idx` ON `campaign_webhook_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `campaign_webhook_events_campaign_idx` ON `campaign_webhook_events` (`campaign_id`);