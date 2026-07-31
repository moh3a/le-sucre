ALTER TABLE `categories` ADD `image_url` varchar(2048);--> statement-breakpoint
ALTER TABLE `categories` ADD `banner_url` varchar(2048);--> statement-breakpoint
ALTER TABLE `categories` ADD `meta_title` varchar(255);--> statement-breakpoint
ALTER TABLE `categories` ADD `meta_description` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `is_featured` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `categories_featured_active_idx` ON `categories` (`is_featured`,`is_active`);