CREATE TABLE `campaign_automation_log` (
	`id` varchar(255) NOT NULL,
	`rule_id` varchar(255) NOT NULL,
	`campaign_id` varchar(255) NOT NULL,
	`trigger` varchar(64) NOT NULL,
	`action` varchar(64) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`result` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaign_automation_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaign_automation_rules` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger` varchar(64) NOT NULL,
	`action` varchar(64) NOT NULL,
	`campaign_type_filter` varchar(64),
	`status_filter` varchar(32),
	`config` json NOT NULL DEFAULT ('{}'),
	`is_active` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 100,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaign_automation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `automation_log_campaign_idx` ON `campaign_automation_log` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `automation_rules_trigger_idx` ON `campaign_automation_rules` (`trigger`,`is_active`);