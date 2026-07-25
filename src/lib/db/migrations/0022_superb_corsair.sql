CREATE TABLE `database_history` (
	`id` varchar(255) NOT NULL,
	`operation_type` varchar(32) NOT NULL,
	`query` text,
	`table_name` varchar(255),
	`status` varchar(16) NOT NULL DEFAULT 'success',
	`rows_affected` varchar(16),
	`duration_ms` varchar(16),
	`error_message` text,
	`file_name` varchar(255),
	`file_format` varchar(16),
	`executed_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `database_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `db_history_type_idx` ON `database_history` (`operation_type`);--> statement-breakpoint
CREATE INDEX `db_history_status_idx` ON `database_history` (`status`);--> statement-breakpoint
CREATE INDEX `db_history_created_idx` ON `database_history` (`created_at`);